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
  Row,
  Column,
} from "@react-email/components";
import * as React from "react";

export interface CryptoNotificationEmailProps {
  name: string;
  amount: string;
  cryptoType: string;
  network: string;
  receiverEmail: string;
  referenceId: string;
  message: string;
}

export const CryptoNotificationEmail = ({
  name = "John Doe",
  amount = "0.00",
  cryptoType = "USDT",
  network = "Ethereum",
  receiverEmail = "recipient@example.com",
  referenceId = "REF-000000",
  message = "Your transaction has been processed successfully.",
}: CryptoNotificationEmailProps) => {
  const previewText = `Transaction notification: ${amount} ${cryptoType} via ${network}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={headerTitle}>Transaction Notification</Heading>
            <Text style={headerSubtitle}>Secure Crypto Payment Alert</Text>
          </Section>

          {/* Greeting */}
          <Section style={content}>
            <Text style={greeting}>Hello {name},</Text>
            <Text style={paragraph}>
              A transaction has been initiated with the following details. Please
              review carefully.
            </Text>
          </Section>

          {/* Details Card */}
          <Section style={card}>
            <Row style={detailRow}>
              <Column style={labelCol}>
                <Text style={label}>Amount</Text>
              </Column>
              <Column style={valueCol}>
                <Text style={valueHighlight}>
                  {amount} {cryptoType}
                </Text>
              </Column>
            </Row>

            <Hr style={divider} />

            <Row style={detailRow}>
              <Column style={labelCol}>
                <Text style={label}>Network</Text>
              </Column>
              <Column style={valueCol}>
                <Text style={value}>{network}</Text>
              </Column>
            </Row>

            <Hr style={divider} />

            <Row style={detailRow}>
              <Column style={labelCol}>
                <Text style={label}>Crypto Type</Text>
              </Column>
              <Column style={valueCol}>
                <Text style={value}>{cryptoType}</Text>
              </Column>
            </Row>

            <Hr style={divider} />

            <Row style={detailRow}>
              <Column style={labelCol}>
                <Text style={label}>Receiver</Text>
              </Column>
              <Column style={valueCol}>
                <Text style={value}>{receiverEmail}</Text>
              </Column>
            </Row>

            <Hr style={divider} />

            <Row style={detailRow}>
              <Column style={labelCol}>
                <Text style={label}>Reference ID</Text>
              </Column>
              <Column style={valueCol}>
                <Text style={valueMono}>{referenceId}</Text>
              </Column>
            </Row>
          </Section>

          {/* Message */}
          {message ? (
            <Section style={messageSection}>
              <Text style={messageLabel}>Message</Text>
              <Text style={messageText}>{message}</Text>
            </Section>
          ) : null}

          {/* Footer */}
          <Section style={footer}>
            <Hr style={footerDivider} />
            <Text style={footerText}>
              This is an automated notification. If you did not expect this
              email, please contact support immediately.
            </Text>
            <Text style={footerText}>
              © {new Date().getFullYear()} Secure Payments. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default CryptoNotificationEmail;

// Styles
const main = {
  backgroundColor: "#f4f6f9",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
  margin: "0",
  padding: "0",
};

const container = {
  backgroundColor: "#ffffff",
  margin: "40px auto",
  maxWidth: "560px",
  borderRadius: "12px",
  overflow: "hidden" as const,
  boxShadow: "0 4px 24px rgba(0, 0, 0, 0.08)",
};

const header = {
  backgroundColor: "#0f172a",
  padding: "32px 40px",
  textAlign: "center" as const,
};

const headerTitle = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "700",
  margin: "0 0 6px",
  letterSpacing: "-0.3px",
};

const headerSubtitle = {
  color: "#94a3b8",
  fontSize: "14px",
  margin: "0",
  fontWeight: "400",
};

const content = {
  padding: "32px 40px 16px",
};

const greeting = {
  color: "#0f172a",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0 0 12px",
};

const paragraph = {
  color: "#475569",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0",
};

const card = {
  margin: "8px 24px 24px",
  backgroundColor: "#f8fafc",
  borderRadius: "10px",
  border: "1px solid #e2e8f0",
  padding: "8px 0",
};

const detailRow = {
  padding: "12px 24px",
};

const labelCol = {
  width: "40%",
  verticalAlign: "middle" as const,
};

const valueCol = {
  width: "60%",
  verticalAlign: "middle" as const,
  textAlign: "right" as const,
};

const label = {
  color: "#64748b",
  fontSize: "13px",
  fontWeight: "500",
  margin: "0",
  textTransform: "uppercase" as const,
  letterSpacing: "0.4px",
};

const value = {
  color: "#0f172a",
  fontSize: "15px",
  fontWeight: "600",
  margin: "0",
};

const valueHighlight = {
  color: "#059669",
  fontSize: "18px",
  fontWeight: "700",
  margin: "0",
};

const valueMono = {
  color: "#0f172a",
  fontSize: "13px",
  fontWeight: "600",
  margin: "0",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
};

const divider = {
  borderColor: "#e2e8f0",
  margin: "0 24px",
};

const messageSection = {
  padding: "0 40px 32px",
};

const messageLabel = {
  color: "#64748b",
  fontSize: "12px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  margin: "0 0 8px",
};

const messageText = {
  color: "#334155",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0",
  backgroundColor: "#f1f5f9",
  padding: "14px 16px",
  borderRadius: "8px",
  borderLeft: "3px solid #0f172a",
};

const footer = {
  padding: "0 40px 32px",
};

const footerDivider = {
  borderColor: "#e2e8f0",
  margin: "0 0 20px",
};

const footerText = {
  color: "#94a3b8",
  fontSize: "12px",
  lineHeight: "18px",
  margin: "0 0 6px",
  textAlign: "center" as const,
};
