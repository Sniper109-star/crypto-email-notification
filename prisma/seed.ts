/**
 * Seed the default "Transaction Confirmation" template.
 * Run after migrate: npx prisma db seed
 *
 * This is the example required by the specification.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const defaultEditorJson = {
  version: 1 as const,
  variables: [
    "name",
    "amount",
    "crypto_type",
    "network",
    "receiver_email",
    "message",
    "reference_id",
  ],
  blocks: [
    {
      id: "hdr-1",
      type: "header",
      logoText: "BINANCE",
      backgroundColor: "#0b0e11",
      textColor: "#f0b90b",
    },
    {
      id: "h-1",
      type: "heading",
      content: "{{crypto_type}} Deposit Successful",
      level: 1,
      align: "left",
    },
    {
      id: "t-1",
      type: "text",
      content:
        "Hello {{name}},\n\nYour deposit of {{amount}} {{crypto_type}} is now available in your account.\n\nNetwork: {{network}}\nReceiver: {{receiver_email}}\nMessage: {{message}}\nReference ID: {{reference_id}}",
      align: "left",
    },
    {
      id: "btn-1",
      type: "button",
      label: "Visit Your Dashboard",
      href: "https://www.binance.com",
      backgroundColor: "#f0b90b",
      textColor: "#1e2329",
      align: "left",
    },
    {
      id: "div-1",
      type: "divider",
      color: "#f0b90b",
    },
    {
      id: "ft-1",
      type: "footer",
      content:
        "Risk warning: Cryptocurrency trading is subject to high market risk. Please trade with caution.",
    },
  ],
};

async function main() {
  const existing = await prisma.template.findFirst({
    where: { name: "Transaction Confirmation" },
  });

  if (existing) {
    console.log("Default template already exists:", existing.id);
    return;
  }

  // Placeholder HTML – in the full app this is rendered from editorJson via MJML/React Email
  const placeholderHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Transaction Confirmation</title></head>
<body style="font-family:sans-serif;max-width:600px;margin:0 auto;">
  <div style="background:#0b0e11;color:#f0b90b;padding:20px;text-align:center;font-weight:700;">◆ BINANCE</div>
  <div style="padding:32px 40px;">
    <h1>{{crypto_type}} Deposit Successful</h1>
    <p>Hello {{name}},</p>
    <p>Your deposit of <strong>{{amount}} {{crypto_type}}</strong> is now available.</p>
    <p>Network: {{network}}<br>Receiver: {{receiver_email}}<br>Message: {{message}}<br>Reference ID: {{reference_id}}</p>
    <a href="https://www.binance.com" style="background:#f0b90b;color:#1e2329;padding:14px 28px;text-decoration:none;font-weight:700;display:inline-block;border-radius:4px;">Visit Your Dashboard</a>
  </div>
</body>
</html>`.trim();

  const template = await prisma.template.create({
    data: {
      name: "Transaction Confirmation",
      description: "Responsive transaction confirmation email.",
      subject: "Transaction for {{name}} — {{crypto_type}} {{amount}}",
      editorJson: defaultEditorJson,
      html: placeholderHtml,
      isDefault: true,
    },
  });

  console.log("Seeded default template:", template.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
