# Crypto Email Template Builder

Production-oriented Next.js + TypeScript application for sending professional crypto transaction notification emails via **Resend**.

**Phase 1 (current):** Polished Binance-style sender with mandatory final rendered preview.  
**Phase 2 (scaffolded):** Full visual template builder with PostgreSQL, Google OAuth, block editor, and MJML-ready architecture.

---

## Project Structure

```
email-template-builder/
├── Dockerfile                    # Multi-stage production image
├── docker-compose.yml            # App + PostgreSQL with persistent volume
├── .env.example                  # All required env vars (no secrets)
├── .gitignore
├── package.json
├── next.config.ts
├── tsconfig.json
├── README.md
│
├── prisma/
│   ├── schema.prisma             # Users, Templates (editor_json + html), SendLog, NextAuth models
│   └── seed.ts                   # Seeds "Transaction Confirmation" example template
│
└── src/
    ├── app/
    │   ├── api/
    │   │   └── send/
    │   │       └── route.ts      # Secure POST /api/send (Resend + rate limit + Zod)
    │   ├── globals.css           # Dashboard + preview styles
    │   ├── layout.tsx
    │   └── page.tsx              # Form → Final Preview → Confirm Send flow
    │
    ├── emails/
    │   └── crypto-notification.tsx  # Binance-style React Email template
    │
    ├── lib/
    │   ├── rate-limit.ts         # In-memory rate limiter (5 req/min/IP)
    │   └── validation.ts         # Zod schema + NETWORKS / CRYPTO_TYPES
    │
    └── types/
        └── template.ts           # EditorBlock types, EditorDocument, DEFAULT_VARIABLES
```

---

## Features

### Phase 1 – Ready today
- [x] Binance-style deposit email matching the reference design
- [x] Mandatory final rendered preview (no `{{variables}}` left)
- [x] Server-side Zod validation
- [x] In-memory rate limiting
- [x] Resend delivery (API key never exposed to browser)
- [x] Loading states, error feedback, responsive UI
- [x] TypeScript throughout

### Phase 2 – Scaffolded for full builder
- [ ] Google OAuth admin authentication (NextAuth)
- [ ] Template CRUD (create / edit / duplicate / rename / delete / set default)
- [ ] Visual block editor (mobile-friendly: Add / Move Up / Down / Edit / Duplicate / Delete)
- [ ] `editor_json` as source of truth + cached HTML
- [ ] MJML / React Email rendering pipeline
- [ ] Subject variable substitution server-side
- [ ] HTML escaping of variable values
- [ ] Persistent templates in PostgreSQL
- [ ] Docker + docker-compose with volume persistence

---

## Architecture (target)

```
User
  ↓
React dashboard
  ↓
Google OAuth (NextAuth) ──► protected routes only
  ↓
Backend API (server-side auth check)
  ↓
PostgreSQL (Prisma) ──► templates.editor_json (source of truth)
  ↓
MJML / React Email renderer
  ↓
Resend API ──► Recipient inbox
```

The browser never receives `RESEND_API_KEY`, `GOOGLE_CLIENT_SECRET`, `AUTH_SECRET`, or `DATABASE_URL`.

---

## Requirements

- Node.js 18+
- [Resend](https://resend.com) account + API key
- (Phase 2) PostgreSQL 14+
- (Phase 2) Google Cloud OAuth credentials

---

## Quick Start (Phase 1)

```bash
git clone https://github.com/Sniper109-star/crypto-email-notification.git
cd crypto-email-notification
npm install
cp .env.example .env.local
```

Edit `.env.local`:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=onboarding@resend.dev
```

```bash
npm run dev
```

Open http://localhost:3000

1. Fill the form (name, amount, crypto, network, receiver, reference, message)
2. Click **Review Email →**
3. Confirm the fully rendered subject + body (no placeholders)
4. Click **Send Email**

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `RESEND_API_KEY` | Yes | From https://resend.com/api-keys |
| `RESEND_FROM_EMAIL` | Yes | Verified sender (or `onboarding@resend.dev` for testing) |
| `DATABASE_URL` | Phase 2 | e.g. `postgresql://postgres:postgres@localhost:5432/email_templates?schema=public` |
| `AUTH_SECRET` | Phase 2 | Generate with `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | Phase 2 | Google Cloud Console → APIs & Services → Credentials |
| `GOOGLE_CLIENT_SECRET` | Phase 2 | Same |
| `NEXTAUTH_URL` | Phase 2 | e.g. `http://localhost:3000` |

Never commit real credentials. Never put secrets in frontend code.

---

## API

### `POST /api/send`

```json
{
  "name": "John",
  "amount": "0.07382054",
  "cryptoType": "ETH",
  "network": "Ethereum",
  "receiverEmail": "recipient@example.com",
  "referenceId": "TX-001",
  "message": "Optional note"
}
```

**Success (200)**
```json
{ "success": true, "message": "Email sent successfully", "id": "..." }
```

**Validation / rate-limit / server errors**
```json
{ "success": false, "error": "..." }
```

Rate limit: 5 requests per minute per IP.

---

## Docker (Phase 2)

```bash
cp .env.example .env
# fill RESEND_*, AUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
docker compose up -d
```

- Postgres data persists in the `pgdata` volume
- App waits for database healthcheck before starting

---

## Google OAuth Setup (Phase 2)

1. Open https://console.cloud.google.com/apis/credentials
2. Create **OAuth 2.0 Client ID** (Web application)
3. Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copy Client ID and Client Secret into `.env`

---

## Database (Phase 2)

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

This creates the tables and seeds the **Transaction Confirmation** example template with variables:

`{{name}}` `{{amount}}` `{{crypto_type}}` `{{network}}` `{{receiver_email}}` `{{message}}` `{{reference_id}}`

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run email:dev` | Preview React Email templates |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run migrations |
| `npm run db:seed` | Seed default template |
| `npm run db:studio` | Open Prisma Studio |

---

## Security Notes

- Rate limiting applied server-side on `/api/send`
- All request validation is server-side (Zod)
- React Email produces email-client-safe HTML
- Variable values must be HTML-escaped before injection (Phase 2)
- Secrets never returned in API responses
- Templates are loaded by ID from the database on send — never trusted from the browser

---

## Testing Checklist (Phase 1)

- [ ] Form validation (missing name, invalid amount, invalid email)
- [ ] Final preview shows real values, not `{{…}}`
- [ ] Successful send returns Resend message ID
- [ ] Invalid recipient returns clear error
- [ ] Rate limit returns 429 after 5 rapid requests
- [ ] Secrets never appear in network responses or client bundles

---

## Next Steps for Full Visual Builder

1. Install remaining packages:
   ```bash
   npm i @prisma/client next-auth @auth/prisma-adapter mjml
   npm i -D prisma ts-node
   ```
2. Run migrations and seed
3. Implement NextAuth with Google provider + middleware protecting `/dashboard` and `/api/templates/*`
4. Build block editor UI (list of blocks + mobile Move Up / Move Down / Add / Edit / Delete)
5. Render path: `editorJson` → MJML / React Email → HTML, store both on save
6. Implement `POST /api/send-email` that:
   - Authenticates the request
   - Loads template by ID from PostgreSQL
   - Escapes variable values
   - Renders subject + HTML
   - Sends via Resend
7. Add confirmation dialogs, toasts, and tests

---

## License

MIT
