import { cookies } from 'next/headers';

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="card">
        <h1>Crypto Transaction Email Notification</h1>
        <p>
          Send professional crypto transaction alerts with validation, retry handling,
          logging, and monitoring.
        </p>

        <form action="/api/send" method="post" className="form-grid">
          <label>
            Name
            <input name="name" type="text" required placeholder="Alice Smith" />
          </label>
          <label>
            Amount
            <input name="amount" type="text" required placeholder="1250.50" />
          </label>
          <label>
            Crypto Type
            <select name="cryptoType" defaultValue="USDT">
              <option value="BTC">BTC</option>
              <option value="ETH">ETH</option>
              <option value="USDT">USDT</option>
              <option value="SOL">SOL</option>
            </select>
          </label>
          <label>
            Network
            <select name="network" defaultValue="Ethereum">
              <option value="Ethereum">Ethereum</option>
              <option value="Bitcoin">Bitcoin</option>
              <option value="Solana">Solana</option>
              <option value="Polygon">Polygon</option>
            </select>
          </label>
          <label className="full-width">
            Receiver Email
            <input name="receiverEmail" type="email" required placeholder="alice@example.com" />
          </label>
          <label className="full-width">
            Reference ID
            <input name="referenceId" type="text" required placeholder="TX-20240925-001" />
          </label>
          <label className="full-width">
            Message
            <textarea name="message" rows={4} placeholder="Payment for invoice #4421" />
          </label>

          <button type="submit">Send Notification</button>
        </form>
      </section>
    </main>
  );
}
