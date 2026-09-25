"use client";

import { useState, FormEvent } from "react";
import { NETWORKS, CRYPTO_TYPES } from "@/lib/validation";

type FormState = {
  name: string;
  amount: string;
  cryptoType: string;
  network: string;
  receiverEmail: string;
  referenceId: string;
  message: string;
};

type Feedback = {
  type: "success" | "error";
  text: string;
} | null;

const initialForm: FormState = {
  name: "",
  amount: "",
  cryptoType: "USDT",
  network: "Ethereum",
  receiverEmail: "",
  referenceId: "",
  message: "",
};

export default function HomePage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  function update(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFeedback(null);
    setFieldErrors({});
    setLoading(true);

    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.details) {
          setFieldErrors(data.details);
        }
        setFeedback({
          type: "error",
          text: data.error || "Failed to send email",
        });
        return;
      }

      setFeedback({
        type: "success",
        text: `Email sent successfully to ${form.receiverEmail}`,
      });
      setForm(initialForm);
    } catch {
      setFeedback({
        type: "error",
        text: "Network error. Please check your connection and try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="card">
        <h1 className="title">Send Notification</h1>
        <p className="subtitle">
          Fill in the transaction details and send a secure email notification.
        </p>

        {feedback && (
          <div
            className={`alert ${
              feedback.type === "success" ? "alert-success" : "alert-error"
            }`}
            role="alert"
          >
            {feedback.text}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              placeholder="Recipient name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              required
              autoComplete="name"
            />
            {fieldErrors.name && (
              <p className="error-text">{fieldErrors.name[0]}</p>
            )}
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label htmlFor="amount">Amount</label>
              <input
                id="amount"
                type="text"
                inputMode="decimal"
                placeholder="e.g. 1500.00"
                value={form.amount}
                onChange={(e) => update("amount", e.target.value)}
                required
              />
              {fieldErrors.amount && (
                <p className="error-text">{fieldErrors.amount[0]}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="cryptoType">Crypto Type</label>
              <select
                id="cryptoType"
                value={form.cryptoType}
                onChange={(e) => update("cryptoType", e.target.value)}
              >
                {CRYPTO_TYPES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {fieldErrors.cryptoType && (
                <p className="error-text">{fieldErrors.cryptoType[0]}</p>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="network">Network</label>
            <select
              id="network"
              value={form.network}
              onChange={(e) => update("network", e.target.value)}
            >
              {NETWORKS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            {fieldErrors.network && (
              <p className="error-text">{fieldErrors.network[0]}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="receiverEmail">Receiver Email</label>
            <input
              id="receiverEmail"
              type="email"
              placeholder="recipient@example.com"
              value={form.receiverEmail}
              onChange={(e) => update("receiverEmail", e.target.value)}
              required
              autoComplete="email"
            />
            {fieldErrors.receiverEmail && (
              <p className="error-text">{fieldErrors.receiverEmail[0]}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="referenceId">Reference ID</label>
            <input
              id="referenceId"
              type="text"
              placeholder="e.g. TX-20240925-001"
              value={form.referenceId}
              onChange={(e) => update("referenceId", e.target.value)}
              required
            />
            {fieldErrors.referenceId && (
              <p className="error-text">{fieldErrors.referenceId[0]}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="message">Message (optional)</label>
            <textarea
              id="message"
              rows={3}
              placeholder="Additional note for the recipient"
              value={form.message}
              onChange={(e) => update("message", e.target.value)}
              maxLength={500}
            />
            {fieldErrors.message && (
              <p className="error-text">{fieldErrors.message[0]}</p>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? "Sending…" : "Send Notification"}
          </button>
        </form>
      </div>
    </div>
  );
}
