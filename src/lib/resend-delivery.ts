import { render } from "@react-email/components";
import { Resend } from "resend";
import { CryptoNotificationEmail } from "@/emails/crypto-notification";
import { prisma } from "@/lib/prisma";
import type { SendEmailInput } from "@/lib/validation";

export async function deliverCryptoEmail(data: SendEmailInput) {
  const apiKey = process.env.RESEND_API;
  if (!apiKey) throw new Error("RESEND_API is not configured");

  const from = (process.env.RESEND_FROM_EMAIL_2 || process.env.RESEND_FROM_EMAIL)?.trim();
  if (!from) throw new Error("RESEND_FROM_EMAIL is not configured");

  // Resend's sandbox sender can only deliver to the account owner's email.
  // Any other recipient requires a verified sender domain in Resend.
  if (from.toLowerCase().includes("@resend.dev") && !data.receiverEmail.toLowerCase().endsWith("@resend.dev")) {
    throw new Error("Resend sandbox senders can only deliver to the account owner's email; verify a sending domain for arbitrary recipients");
  }
  const to = [data.receiverEmail];
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
