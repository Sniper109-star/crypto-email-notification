import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

export interface CryptoNotificationEmailProps {
  name?: string;
  amount: string;
  cryptoType: string;
  network: string;
  receiverEmail: string;
  referenceId: string;
  message?: string;
}

/**
 * Production crypto deposit confirmation email.
 * Uses only application-owned copy and links so recipients can verify the notification safely.
 * Email-client safe via React Email.
 */
export const CryptoNotificationEmail = ({
  name = "Customer",
  amount = "0.07382054",
  cryptoType = "ETH",
  network = "Ethereum",
  receiverEmail = "recipient@example.com",
  referenceId = "REF-000000",
  message = "",
}: CryptoNotificationEmailProps) => {
  const previewText = `${cryptoType} deposit confirmation · ${referenceId}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Black header bar – matches screenshot */}
          <Section style={header}>
            <Text style={logoText}>
              <span style={logoIcon}>◆</span> CRYPTO NOTIFICATIONS
            </Text>
          </Section>

          {/* Main content – exact copy from reference image */}
          <Section style={content}>
            <Heading style={title}>Deposit confirmation</Heading>

            <Text style={paragraph}>
              Hello {name}, your {amount} {cryptoType} deposit on the {network} network has been recorded successfully.
            </Text>

            <Section style={detailsCard}>
              <Text style={detailLabel}>Reference ID</Text>
              <Text style={detailValue}>{referenceId}</Text>
              <Text style={detailLabel}>Recipient email</Text>
              <Text style={detailValue}>{receiverEmail}</Text>
            </Section>

            {message ? <Text style={paragraph}>{message}</Text> : null}

            <Text style={paragraph}>
              If you did not initiate this activity, contact your account administrator through your usual trusted channel. Do not reply to this automated message or share passwords, recovery phrases, or private keys.
            </Text>

            <Text style={automatedNote}>
              This is an automated notification from Crypto Notifications.
            </Text>
          </Section>

          <Hr style={divider} />

          <Section style={footerSection}>
            <Text style={footerText}>
              Crypto Notifications sends transactional messages only. Verify deposit details in your official account before taking action.
            </Text>
            <Text style={footerText}>
              Never share passwords, recovery phrases, private keys, or authentication codes by email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default CryptoNotificationEmail;

/* -------------------------------------------------------------------------- */
/* Styles – email-safe, inline, Gmail / Outlook / Apple Mail compatible      */
/* -------------------------------------------------------------------------- */

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
  margin: "0",
  padding: "0",
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  maxWidth: "600px",
  padding: "0",
};

const header = {
  backgroundColor: "#0b0e11",
  padding: "20px 24px",
  textAlign: "center" as const,
};

const logoText = {
  color: "#f0b90b",
  fontSize: "22px",
  fontWeight: "700",
  margin: "0",
  letterSpacing: "1px",
};

const logoIcon = {
  color: "#f0b90b",
  marginRight: "6px",
};

const content = {
  padding: "32px 40px 16px",
};

const title = {
  color: "#1e2329",
  fontSize: "28px",
  fontWeight: "700",
  margin: "0 0 20px",
  lineHeight: "1.3",
};

const paragraph = {
  color: "#1e2329",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0 0 20px",
};

const highlightLink = {
  color: "#c99400",
  textDecoration: "underline",
};

const buttonSection = {
  margin: "8px 0 28px",
};

const button = {
  backgroundColor: "#f0b90b",
  borderRadius: "4px",
  color: "#1e2329",
  fontSize: "15px",
  fontWeight: "700",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 28px",
};

const detailsCard = {
  backgroundColor: "#f7f8fa",
  border: "1px solid #e6e8eb",
  borderRadius: "8px",
  margin: "24px 0",
  padding: "18px 20px",
};

const detailLabel = {
  color: "#707a8a",
  fontSize: "12px",
  fontWeight: "700",
  letterSpacing: "0.5px",
  margin: "0 0 4px",
  textTransform: "uppercase" as const,
};

const detailValue = {
  color: "#1e2329",
  fontSize: "15px",
  lineHeight: "22px",
  margin: "0 0 14px",
  wordBreak: "break-word" as const,
};

const automatedNote = {
  color: "#1e2329",
  fontSize: "14px",
  fontStyle: "italic" as const,
  margin: "24px 0 8px",
  lineHeight: "22px",
};

const divider = {
  borderColor: "#f0b90b",
  borderWidth: "1px",
  margin: "16px 40px",
};

const socialSection = {
  padding: "16px 40px 8px",
  textAlign: "center" as const,
};

const stayConnected = {
  color: "#c99400",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 16px",
  textAlign: "center" as const,
};

const socialIcons = {
  color: "#707a8a",
  fontSize: "18px",
  margin: "0 0 16px",
  textAlign: "center" as const,
  letterSpacing: "8px",
};

const socialLink = {
  color: "#707a8a",
  textDecoration: "none",
};

const footerSection = {
  padding: "8px 40px 40px",
};

const footerText = {
  color: "#1e2329",
  fontSize: "13px",
  lineHeight: "20px",
  margin: "0 0 16px",
};
