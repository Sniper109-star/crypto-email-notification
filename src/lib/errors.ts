/**
 * Shared API error helpers.
 * Never expose stack traces, secrets, or internal details to the client.
 */

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "INVALID_JSON"
  | "RATE_LIMITED"
  | "CONFIG_ERROR"
  | "RENDER_ERROR"
  | "RESEND_ERROR"
  | "INVALID_RECIPIENT"
  | "METHOD_NOT_ALLOWED"
  | "UNEXPECTED";

export interface ApiErrorBody {
  success: false;
  error: string;
  code?: ApiErrorCode;
  details?: Record<string, string[] | undefined>;
  retryAfter?: number;
}

export interface ApiSuccessBody {
  success: true;
  message: string;
  id?: string;
}

export type ApiResponse = ApiErrorBody | ApiSuccessBody;

/** Map known Resend error messages to safe user-facing text */
export function mapResendError(message: string | undefined): {
  status: number;
  code: ApiErrorCode;
  error: string;
} {
  const msg = (message || "").toLowerCase();

  if (
    msg.includes("invalid") &&
    (msg.includes("email") || msg.includes("recipient") || msg.includes("to"))
  ) {
    return {
      status: 400,
      code: "INVALID_RECIPIENT",
      error: "Invalid recipient email address.",
    };
  }

  if (msg.includes("domain") || msg.includes("not verified") || msg.includes("from")) {
    return {
      status: 502,
      code: "RESEND_ERROR",
      error:
        "Sender email is not verified in Resend. Check RESEND_FROM_EMAIL.",
    };
  }

  if (msg.includes("api key") || msg.includes("unauthorized") || msg.includes("forbidden")) {
    return {
      status: 502,
      code: "RESEND_ERROR",
      error: "Email service configuration error. Please contact support.",
    };
  }

  if (msg.includes("rate") || msg.includes("too many")) {
    return {
      status: 429,
      code: "RATE_LIMITED",
      error: "Too many requests. Please try again later.",
    };
  }

  return {
    status: 502,
    code: "RESEND_ERROR",
    error: "Failed to send email. Please try again later.",
  };
}
