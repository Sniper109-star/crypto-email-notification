import { Html, Head, Body, Container, Text, Link } from '@react-email/components';

export type CryptoNotificationProps = {
  name: string;
  amount: string;
  cryptoType: string;
  network: string;
  receiverEmail: string;
  referenceId: string;
  message?: string;
};

export default function CryptoNotificationEmail({
  name,
  amount,
  cryptoType,
  network,
  receiverEmail,
  referenceId,
  message,
}: CryptoNotificationProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f4f4', padding: '40px 0' }}>
        <Container style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '32px', maxWidth: '600px', margin: '0 auto' }}>
          <Text style={{ fontSize: '28px', fontWeight: 700, marginBottom: '20px' }}>Crypto Transaction Alert</Text>
          <Text style={{ fontSize: '16px', marginBottom: '12px' }}>
            Hello <strong>{name}</strong>,
          </Text>
          <Text style={{ fontSize: '16px', marginBottom: '12px' }}>
            We have received a crypto transaction notification for <strong>{amount}</strong> {cryptoType} on {network}.
          </Text>
          <Text style={{ fontSize: '16px', marginBottom: '12px' }}>
            Receiver: <strong>{receiverEmail}</strong>
          </Text>
          <Text style={{ fontSize: '16px', marginBottom: '12px' }}>
            Reference ID: <strong>{referenceId}</strong>
          </Text>
          {message ? (
            <Text style={{ fontSize: '16px', marginBottom: '12px' }}>
              Message: <strong>{message}</strong>
            </Text>
          ) : null}
          <Link href="https://example.com" style={{ color: '#2563eb' }}>Review transaction</Link>
        </Container>
      </Body>
    </Html>
  );
}
