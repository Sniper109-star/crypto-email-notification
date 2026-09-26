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
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

    if (!apiKey) {
      console.error("[send] Missing RESEND_API_KEY");
      return errorResponse(
        {
          success: false,
          error: "Server configuration error. Please contact support.",
          code: "CONFIG_ERROR",
        },
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
        {
          success: false,
          error: "Failed to render email template. Please try again.",
          code: "RENDER_ERROR",
        },
        500
      );
    }

    // --- Send via Resend ---
    const resend = new Resend(apiKey);
    let sendData: { id?: string } | null = null;
    let sendError: { message?: string } | null = null;

    try {
      const result = await resend.emails.send(
        {
          from: fromEmail,
          to: data.receiverEmail,
          subject: `${data.cryptoType} Deposit Successful`,
          html,
        },
        { idempotencyKey: `crypto-deposit/${data.referenceId}` }
      );
      sendData = result.data;
      sendError = result.error;
    } catch (resendErr) {
      console.error("[send] Resend request failed:", resendErr);
      await persistSendLog({
        toEmail: data.receiverEmail,
        subject: `${data.cryptoType} Deposit Successful`,
        success: false,
        error: "RESEND_REQUEST_FAILED",
      });
      return errorResponse(
        {
          success: false,
          error: "Email service is temporarily unavailable. Please try again.",
          code: "RESEND_ERROR",
        },
        502
      );
    }

    if (sendError) {
      console.error("[send] Resend error:", sendError);
      await persistSendLog({
        toEmail: data.receiverEmail,
        subject: `${data.cryptoType} Deposit Successful`,
        success: false,
        error: sendError.message || "EMAIL_SERVICE_REJECTED",
      });
      const mapped = mapResendError(sendError.message || "Email service rejected the request.");
      return errorResponse(
        {
          success: false,
          error: mapped.error,
          code: mapped.code,
        },
        mapped.status
      );
    }

    if (!sendData?.id) {
      console.error("[send] Resend returned no message id");
      return errorResponse(
        {
          success: false,
          error: "Email service did not confirm delivery. Please try again.",
          code: "RESEND_ERROR",
        },
        502
      );
    }

    await persistSendLog({
      toEmail: data.receiverEmail,
      subject: `${data.cryptoType} Deposit Successful`,
      messageId: sendData.id,
      success: true,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Email sent successfully",
        id: sendData.id,
      },
      {
        status: 200,
        headers: {
          "X-RateLimit-Remaining": String(limit.remaining),
        },
      }
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
