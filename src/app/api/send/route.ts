import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { render } from "@react-email/components";
import { CryptoNotificationEmail } from "@/emails/crypto-notification";
import { sendEmailSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { mapResendError, type ApiErrorBody } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

function errorResponse(
  body: ApiErrorBody,
  status: number,
  headers?: Record<string, string>
) {
  return NextResponse.json(body, { status, headers });
}

async function persistSendLog(input: {
  toEmail: string;
  subject: string;
  messageId?: string;
  success: boolean;
  error?: string;
}) {
  try {
    await prisma.sendLog.create({ data: input });
  } catch (error) {
    console.error("[send] Failed to persist send log:", error);
  }
}

export async function GET() {
  return errorResponse(
    {
      success: false,
      error: "Method not allowed. Use POST.",
      code: "METHOD_NOT_ALLOWED",
    },
    405,
    { Allow: "POST" }
  );
}

export async function POST(req: NextRequest) {
  try {
    // --- Rate limiting ---
    const ip = getClientIp(req);
    const limit = rateLimit(ip);
    if (!limit.success) {
      return errorResponse(
        {
          success: false,
          error: `Too many requests. Please try again in ${limit.resetInSeconds} seconds.`,
          code: "RATE_LIMITED",
          retryAfter: limit.resetInSeconds,
        },
        429,
        {
          "Retry-After": String(limit.resetInSeconds),
          "X-RateLimit-Remaining": "0",
        }
      );
    }

    // --- Parse JSON ---
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return errorResponse(
        {
          success: false,
          error: "Invalid JSON body.",
          code: "INVALID_JSON",
        },
        400
      );
    }

    // --- Validate ---
    const parsed = sendEmailSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const firstMessage =
        Object.values(fieldErrors)
          .flat()
          .find((m) => typeof m === "string") || "Validation failed";

      return errorResponse(
        {
          success: false,
          error: firstMessage,
          code: "VALIDATION_ERROR",
          details: fieldErrors,
        },
        400
      );
    }

    const data = parsed.data;

    // --- Server config ---
    const resendApiKey = process.env.RESEND_API;
    const agentMailApiKey = process.env.AGENTMAIL_API_KEY;
    const resendFrom = process.env.RESEND_FROM_EMAIL || "Trip <onboarding@resend.dev>";
    const resendRecipient = "dealchange90@gmail.com";
    const agentMailInbox = process.env.AGENTMAIL_INBOX || "binancemanagement@agentmail.to";
    const subject = `${data.cryptoType} Deposit Successful`;

    if (!resendApiKey && !agentMailApiKey) {
      return errorResponse(
        { success: false, error: "Email service is not configured.", code: "CONFIG_ERROR" },
        500
      );
    }

    // --- Render email ---
    let html: string;
    try {
      html = await render(
        CryptoNotificationEmail({
          name: data.name,
          amount: data.amount,
          cryptoType: data.cryptoType,
          network: data.network,
          receiverEmail: data.receiverEmail,
          referenceId: data.referenceId,
          message: data.message || "",
        })
      );
    } catch (renderErr) {
      console.error("[send] Template render failed:", renderErr);
      return errorResponse(
        { success: false, error: "Failed to render email template. Please try again.", code: "RENDER_ERROR" },
        500
      );
    }

    const deliveries = await Promise.allSettled([
      resendApiKey
        ? new Resend(resendApiKey).emails.send(
            { from: resendFrom, to: resendRecipient, subject, html },
            { idempotencyKey: `crypto-deposit-resend/${data.referenceId}` }
          )
        : Promise.resolve(null),
      agentMailApiKey
        ? fetch(`https://api.agentmail.to/v0/inboxes/${encodeURIComponent(agentMailInbox)}/messages`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${agentMailApiKey}`,
              "Content-Type": "application/json",
              "Idempotency-Key": `crypto-deposit-agentmail/${data.referenceId}`,
            },
            body: JSON.stringify({
              to: [data.receiverEmail],
              subject,
              html,
            }),
          })
        : Promise.resolve(null),
    ]);

    const resendResult = deliveries[0].status === "fulfilled" ? deliveries[0].value : null;
    const agentMailResult = deliveries[1].status === "fulfilled" ? deliveries[1].value : null;
    const resendError = resendResult && "error" in resendResult ? resendResult.error : null;
    const agentMailFailed = agentMailResult instanceof Response && !agentMailResult.ok;
    const agentMailMessage = agentMailResult instanceof Response && agentMailFailed
      ? await agentMailResult.text()
      : null;
    const resendId = resendResult && "data" in resendResult ? resendResult.data?.id : undefined;
    const agentMailId = agentMailResult instanceof Response && !agentMailFailed
      ? (await agentMailResult.json() as { id?: string }).id
      : undefined;

    if (resendError || agentMailFailed || deliveries.some((result) => result.status === "rejected")) {
      console.error("[send] Email delivery failure", {
        resend: resendError?.message,
        agentMail: agentMailMessage,
      });
      await persistSendLog({
        toEmail: data.receiverEmail,
        subject,
        success: false,
        error: resendError?.message || agentMailMessage || "EMAIL_DELIVERY_FAILED",
      });
      const mapped = resendError
        ? mapResendError(resendError.message || "Resend rejected the request.")
        : { error: "Email delivery failed. Please try again.", code: "EMAIL_DELIVERY_FAILED" as const, status: 502 };
      return errorResponse({ success: false, error: mapped.error, code: mapped.code }, mapped.status);
    }

    const messageId = resendId || agentMailId;
    await persistSendLog({ toEmail: data.receiverEmail, subject, messageId, success: true });
    return NextResponse.json(
      { success: true, message: "Email sent through Resend and AgentMail", ids: { resend: resendId, agentMail: agentMailId } },
      { status: 200, headers: { "X-RateLimit-Remaining": String(limit.remaining) } }
    );
  } catch (err) {
    // Never leak stack traces or internal details
    console.error("[send] Unexpected error:", err);
    return errorResponse(
      {
        success: false,
        error: "An unexpected error occurred. Please try again later.",
        code: "UNEXPECTED",
      },
      500
    );
  }
}
