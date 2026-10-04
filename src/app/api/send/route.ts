import { NextRequest, NextResponse } from "next/server";
import { sendEmailSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { mapResendError, type ApiErrorBody } from "@/lib/errors";
import { deliverCryptoEmail, persistFailedDelivery } from "@/lib/resend-delivery";

export const runtime = "nodejs";

function getClientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
}

function errorResponse(body: ApiErrorBody, status: number, headers?: Record<string, string>) {
  return NextResponse.json(body, { status, headers });
}

export async function GET() {
  return errorResponse({ success: false, error: "Method not allowed. Use POST.", code: "METHOD_NOT_ALLOWED" }, 405, { Allow: "POST" });
}

export async function POST(req: NextRequest) {
  const limit = rateLimit(getClientIp(req));
  if (!limit.success) {
    return errorResponse(
      { success: false, error: `Too many requests. Please try again in ${limit.resetInSeconds} seconds.`, code: "RATE_LIMITED", retryAfter: limit.resetInSeconds },
      429,
      { "Retry-After": String(limit.resetInSeconds), "X-RateLimit-Remaining": "0" }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse({ success: false, error: "Invalid JSON body.", code: "INVALID_JSON" }, 400);
  }

  const parsed = sendEmailSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const firstMessage = Object.values(fieldErrors).flat().find((message) => typeof message === "string") || "Validation failed";
    return errorResponse({ success: false, error: firstMessage, code: "VALIDATION_ERROR", details: fieldErrors }, 400);
  }

  if (!process.env.RESEND_API) {
    return errorResponse(
      { success: false, error: "Email delivery is not configured correctly.", code: "CONFIG_ERROR" },
      500
    );
  }

  try {
    const result = await deliverCryptoEmail(parsed.data);

    return NextResponse.json(
      {
        success: true,
        message: "Email sent successfully.",
        id: result.id,
      },
      { status: 200, headers: { "X-RateLimit-Remaining": String(limit.remaining) } }
    );
  } catch (error) {
    await persistFailedDelivery(parsed.data, error);
    const message = error instanceof Error ? error.message : undefined;
    const mapped = mapResendError(message);
    console.error("[send] Resend delivery failed:", error);
    return errorResponse({ success: false, error: mapped.error, code: mapped.code }, mapped.status);
  }
}
