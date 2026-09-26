import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';
import logger from '@/lib/logger';
import { emailSchema } from '@/lib/validation';
import { rateLimiter } from '@/lib/rate-limit';
import { retryWithBackoff } from '@/lib/retry';
import { insertEmailLog, updateEmailLog, getEmailLogByReferenceId } from '@/lib/database';
import { render } from '@react-email/render';
import CryptoNotificationEmail from '@/emails/crypto-notification';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

  try {
    if (!rateLimiter(ip)) {
      logger.warn('Rate limit exceeded', { ip });
      return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();
    const parsed = emailSchema.safeParse(body);

    if (!parsed.success) {
      logger.warn('Validation failed', { errors: parsed.error.issues, ip });
      return NextResponse.json({ success: false, error: 'Validation failed', details: parsed.error.issues }, { status: 400 });
    }

    const emailData = parsed.data;
    const existing = getEmailLogByReferenceId(emailData.referenceId);

    if (existing?.status === 'sent') {
      return NextResponse.json({ success: true, message: 'Email already sent', id: existing.message_id }, { status: 200 });
    }

    const logId = existing?.id ?? insertEmailLog({
      recipient: emailData.receiverEmail,
      name: emailData.name,
      amount: emailData.amount,
      crypto_type: emailData.cryptoType,
      network: emailData.network,
      reference_id: emailData.referenceId,
      status: 'pending',
      attempt_count: 0,
      max_attempts: Number(process.env.MAX_RETRIES || 3),
    });

    let result: any;
    let attemptCount = 0;

    try {
      result = await retryWithBackoff(
        async () => {
          attemptCount += 1;
          updateEmailLog(logId, { attempt_count: attemptCount, status: 'retrying' });

          const emailHtml = await render(CryptoNotificationEmail({ ...emailData }));

          return await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
            to: emailData.receiverEmail,
            subject: `Crypto Transaction Notification - ${emailData.cryptoType}`,
            html: emailHtml,
          });
        },
        {
          maxAttempts: Number(process.env.MAX_RETRIES || 3),
          initialDelayMs: Number(process.env.RETRY_DELAY_MS || 1000),
        },
        `Send email for ${emailData.referenceId}`
      );

      updateEmailLog(logId, {
        message_id: result.id,
        status: 'sent',
        sent_at: new Date().toISOString(),
      });

      logger.info('Email sent successfully', { referenceId: emailData.referenceId, messageId: result.id });

      return NextResponse.json({ success: true, message: 'Email sent successfully', id: result.id }, { status: 200 });
    } catch (sendError) {
      const errorMessage = sendError instanceof Error ? sendError.message : String(sendError);
      updateEmailLog(logId, { status: 'failed', error_message: errorMessage });
      logger.error('Email send failed', { referenceId: emailData.referenceId, error: errorMessage, attemptCount });
      return NextResponse.json({ success: false, error: 'Failed to send email', message: errorMessage }, { status: 500 });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Unexpected error in send route', { error: message, ip });
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
