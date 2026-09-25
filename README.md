# Crypto Transaction Email Notification App

Production-ready Next.js + TypeScript app that sends professional crypto transaction notifications via **Resend** and **React Email**.

The frontend is intentionally minimal: a simple form with the required fields and a single **Send** button.  
Template editing and Resend credentials stay on the server only.

## Features

- Fixed, responsive React Email template with variables:
  - Name, Amount, Crypto Type, Network, Receiver Email, Reference ID, Message
- Zod validation on the server
- In-memory rate limiting (5 requests / minute / IP)
- Clear success / failure feedback
- Secrets (`RESEND_API_KEY`, `RESEND_FROM_EMAIL`) never exposed to the client
- Fully typed TypeScript codebase

## Prerequisites

- Node.js 18+
- A [Resend](https://resend.com) account and API key
- A verified sender domain (or use `onboarding@resend.dev` for testing)

## Setup

```bash
cd crypto-email-notification
npm install
cp .env.example .env.local
```

Edit `.env.local`:

```env
RESEND_API_KEY=re_your_actual_key
RESEND_FROM_EMAIL=onboarding@resend.dev
```

## Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── api/send/route.ts   # Secure POST endpoint
│   ├── page.tsx            # Minimal form UI
│   ├── layout.tsx
│   └── globals.css
├── emails/
│   └── crypto-notification.tsx  # React Email template
└── lib/
    ├── validation.ts       # Zod schema + enums
    └── rate-limit.ts       # Simple rate limiter
```

## API

`POST /api/send`

```json
{
  "name": "Alice Smith",
  "amount": "1250.50",
  "cryptoType": "USDT",
  "network": "Ethereum",
  "receiverEmail": "alice@example.com",
  "referenceId": "TX-20240925-001",
  "message": "Payment for invoice #4421"
}
```

**Success (200)**

```json
{ "success": true, "message": "Email sent successfully", "id": "..." }
```

**Validation error (400)** / **Rate limit (429)** / **Server error (5xx)** return `{ success: false, error: "..." }`.

## Notes

- The drag-and-drop editor (Unlayer) is **not** exposed in the UI. The template is fixed and production-ready. You can iterate on the React Email component offline with `npx email dev` if desired.
- For multi-instance / serverless deployments, replace the in-memory rate limiter with Redis / Upstash.
- Never commit `.env.local`.

## License

MIT
