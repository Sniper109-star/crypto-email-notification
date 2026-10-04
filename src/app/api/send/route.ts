import { Client } from "@upstash/qstash";
import { NextRequest, NextResponse } from "next/server";
import { sendEmailSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { type ApiErrorBody } from "@/lib/errors";
import { getPublicUrl } from "@/lib/resend-delivery";

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

  const token = process.env.QSTASH_TOKEN;
  if (!token) return errorResponse({ success: false, error: "QStash is not configured.", code: "CONFIG_ERROR" }, 500);

  try {
    const client = new Client({ token, ...(process.env.QSTASH_URL ? { baseUrl: process.env.QSTASH_URL } : {}) });
    const result = await client.publishJSON({
      url: `${getPublicUrl(req)}/api/workflows/send-email`,
      body: parsed.data,
      retries: 3,
      headers: { "Content-Type": "application/json" },
    });

    return NextResponse.json(
      { success: true, queued: true, message: "Email queued for delivery through Resend.", messageId: result.messageId },
      { status: 202, headers: { "X-RateLimit-Remaining": String(limit.remaining) } }
    );
  } catch (error) {
    console.error("[send] Failed to queue email:", error);
    return errorResponse({ success: false, error: "Unable to queue email. Please try again.", code: "UNEXPECTED" }, 502);
  }
}
