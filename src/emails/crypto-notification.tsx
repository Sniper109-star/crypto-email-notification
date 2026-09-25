import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
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
  amount = "0.07382054",
  cryptoType = "ETH",
  network = "Ethereum",
  receiverEmail = "recipient@example.com",
  referenceId = "REF-000000",
  message = "",
}: CryptoNotificationEmailProps) => {
  const previewText = `${cryptoType} Deposit Successful`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Binance header bar */}
          <Section style={header}>
            <Text style={logoText}>
              <span style={logoIcon}>◆</span> BINANCE
            </Text>
          </Section>

          {/* Main content */}
          <Section style={content}>
            <Heading style={title}>
              {cryptoType} Deposit Successful
            </Heading>

            <Text style={paragraph}>
              Your deposit of{" "}
              <strong>
                {amount} {cryptoType}
              </strong>{" "}
              is now available in your{" "}
              <Link href="https://www.binance.com" style={highlightLink}>
                Binance
              </Link>{" "}
              account. Log in to check your balance. Read our{" "}
              <Link href="https://www.binance.com/en/support" style={highlightLink}>
                FAQs
              </Link>{" "}
              if you are running into problems.
            </Text>

            <Section style={buttonSection}>
              <Button
                href="https://www.binance.com"
                style={button}
              >
                Visit Your Dashboard
              </Button>
            </Section>

            <Text style={paragraph}>
              Don&apos;t recognize this activity? Please{" "}
              <Link
                href="https://www.binance.com/en/my/security/reset-password"
                style={highlightLink}
              >
                reset your password
              </Link>{" "}
              and contact{" "}
              <Link
                href="https://www.binance.com/en/support"
                style={highlightLink}
              >
                customer support
              </Link>{" "}
              immediately.
            </Text>

            <Text style={automatedNote}>
              This is an automated message, please do not reply.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Stay connected */}
          <Section style={socialSection}>
            <Text style={stayConnected}>Stay connected!</Text>
            <Text style={socialIcons}>
              <Link href="https://twitter.com/binance" style={socialLink}>
                𝕏
              </Link>
              {"  "}
              <Link href="https://t.me/binanceexchange" style={socialLink}>
                ✈
              </Link>
              {"  "}
              <Link href="https://www.facebook.com/binance" style={socialLink}>
                f
              </Link>
              {"  "}
              <Link href="https://www.linkedin.com/company/binance" style={socialLink}>
                in
              </Link>
              {"  "}
              <Link href="https://www.youtube.com/binance" style={socialLink}>
                ▶
              </Link>
              {"  "}
              <Link href="https://www.reddit.com/r/binance" style={socialLink}>
                ●
              </Link>
              {"  "}
              <Link href="https://www.instagram.com/binance" style={socialLink}>
                ◎
              </Link>
            </Text>
          </Section>

          {/* Footer notes */}
          <Section style={footerSection}>
            <Text style={footerText}>
              To stay secure, setup your phishing code{" "}
              <Link
                href="https://www.binance.com/en/my/security/anti-phishing-code"
                style={highlightLink}
              >
                here
              </Link>
            </Text>

            <Text style={footerText}>
              <strong>Risk warning:</strong> Cryptocurrency trading is subject
              to high market risk.{" "}
              <Link href="https://www.binance.com" style={highlightLink}>
                Binance
              </Link>{" "}
              will make the best efforts to choose high-quality coins, but will
              not be responsible for your trading losses. Please trade with
              caution.
            </Text>

            <Text style={footerText}>
              <strong>Kindly note:</strong> Please be aware of phishing sites
              and always make sure you are visiting the official{" "}
              <Link href="https://www.binance.com" style={highlightLink}>
                Binance
              </Link>
              .com website when entering sensitive data.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default CryptoNotificationEmail;

// Styles matching the Binance deposit email
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
  letterSpacing: "12px",
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
