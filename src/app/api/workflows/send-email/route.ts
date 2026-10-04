import { Receiver } from "@upstash/qstash";
import { NextRequest, NextResponse } from "next/server";
import { deliverCryptoEmail, persistFailedDelivery } from "@/lib/resend-delivery";
import { sendEmailSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const currentSigningKey = process.env.QSTASH_CURRENT_SIGNING_KEY;
  const nextSigningKey = process.env.QSTASH_NEXT_SIGNING_KEY;

  if (!currentSigningKey || !nextSigningKey) {
    return NextResponse.json({ error: "QStash signing keys are not configured" }, { status: 500 });
  }

  const receiver = new Receiver({ currentSigningKey, nextSigningKey });
  const signature = req.headers.get("upstash-signature");
  if (!signature || !(await receiver.verify({ signature, body }))) {
    return NextResponse.json({ error: "Invalid QStash signature" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid workflow payload" }, { status: 400 });
  }

  const parsed = sendEmailSchema.safeParse(payload);
  if (!parsed.success) return NextResponse.json({ error: "Invalid workflow payload" }, { status: 400 });

  try {
    const result = await deliverCryptoEmail(parsed.data);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    await persistFailedDelivery(parsed.data, error);
    console.error("[qstash] Resend delivery failed:", error);
    return NextResponse.json({ error: "Resend delivery failed" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405, headers: { Allow: "POST" } });
}
