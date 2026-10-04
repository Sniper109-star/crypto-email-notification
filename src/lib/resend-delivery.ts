import { render } from "@react-email/components";
import { Resend } from "resend";
import { CryptoNotificationEmail } from "@/emails/crypto-notification";
import { prisma } from "@/lib/prisma";
import type { SendEmailInput } from "@/lib/validation";

export async function deliverCryptoEmail(data: SendEmailInput) {
  const apiKey = process.env.RESEND_API;
  if (!apiKey) throw new Error("RESEND_API is not configured");

  const recipient = data.receiverEmail.trim().toLowerCase();
  const sandboxRecipient = (process.env.RESEND_SANDBOX_RECIPIENT_EMAIL || "dealchange90@gmail.com").trim().toLowerCase();
  const configuredFrom = process.env.RESEND_FROM_EMAIL || process.env.RESEND_FROM_EMAIL_2;
  const configuredSender = configuredFrom?.trim().replace(/^['"]|['"]$/g, "");
  const from = recipient === sandboxRecipient ? "onboarding@resend.dev" : configuredSender;

  if (!from || from.startsWith("process.env.")) {
    throw new Error("RESEND_FROM_EMAIL must contain a real verified sender address, not an environment expression");
  }
  if (!/^[^<>@\s]+(?:\s*<[^<>@\s]+@[^<>\s]+>|@[^<>\s]+)$/.test(from)) {
    throw new Error("RESEND_FROM_EMAIL must be a valid email address or `Name <email>` sender");
  }

  // Resend's sandbox sender only delivers to the account owner's email.
  // Use it for the configured account email; all other recipients need a verified domain sender.
  if (from.toLowerCase().includes("@resend.dev") && recipient !== sandboxRecipient) {
    throw new Error("Resend sandbox delivery is limited to the configured Resend account email; verify a sending domain for other recipients");
  }
  const to = [recipient];
  const subject = `${data.cryptoType} Deposit Successful`;
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

  const { data: result, error } = await new Resend(apiKey).emails.send(
    { from, to, subject, html },
    { idempotencyKey: `crypto-deposit-resend/${data.referenceId}` }
  );

  if (error) throw new Error(error.message || "Resend rejected the request");

  if (process.env.DATABASE_URL) {
    try {
      await prisma.sendLog.create({
        data: { toEmail: data.receiverEmail, subject, messageId: result?.id, success: true },
      });
    } catch (logError) {
      console.error("[email] Failed to persist send log:", logError);
    }
  }

  return { id: result?.id, subject };
}

export async function persistFailedDelivery(data: SendEmailInput, error: unknown) {
  if (!process.env.DATABASE_URL) return;

  try {
    await prisma.sendLog.create({
      data: {
        toEmail: data.receiverEmail,
        subject: `${data.cryptoType} Deposit Successful`,
        success: false,
        error: error instanceof Error ? error.message : "EMAIL_DELIVERY_FAILED",
      },
    });
  } catch (logError) {
    console.error("[email] Failed to persist failure log:", logError);
  }
}

export function getPublicUrl(req: Request) {
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  if (configured) return configured.replace(/\/$/, "");
  const url = new URL(req.url);
  const forwardedHost = req.headers.get("x-forwarded-host");
  const forwardedProto = req.headers.get("x-forwarded-proto");
  if (forwardedHost) return `${forwardedProto || url.protocol.replace(":", "")}://${forwardedHost}`;
  return url.origin;
}
