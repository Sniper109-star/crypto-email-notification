import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { render } from "@react-email/components";
import { CryptoNotificationEmail } from "@/emails/crypto-notification";
import { sendEmailSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";

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

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIp(req);
    const limit = rateLimit(ip);
    if (!limit.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Rate limit exceeded. Try again in ${limit.resetInSeconds} seconds.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(limit.resetInSeconds),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    // Parse & validate body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const parsed = sendEmailSchema.safeParse(body);
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: errors,
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Server-only secrets
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL;

    if (!apiKey || !fromEmail) {
      console.error("Missing RESEND_API_KEY or RESEND_FROM_EMAIL");
      return NextResponse.json(
        {
          success: false,
          error: "Server configuration error. Please contact support.",
        },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);

    // Render the React Email template to HTML
    const html = await render(
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

    // Send via Resend
    const { data: sendData, error: sendError } = await resend.emails.send({
      from: fromEmail,
      to: data.receiverEmail,
      subject: `${data.cryptoType} Deposit Successful`,
      html,
    });

    if (sendError) {
      console.error("Resend error:", sendError);
      return NextResponse.json(
        {
          success: false,
          error: sendError.message || "Failed to send email",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Email sent successfully",
        id: sendData?.id,
      },
      {
        status: 200,
        headers: {
          "X-RateLimit-Remaining": String(limit.remaining),
        },
      }
    );
  } catch (err) {
    console.error("Unexpected error in /api/send:", err);
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred. Please try again later.",
      },
      { status: 500 }
    );
  }
}
