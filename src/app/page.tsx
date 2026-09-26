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

type Step = "form" | "preview";

const initialForm: FormState = {
  name: "",
  amount: "",
  cryptoType: "ETH",
  network: "Ethereum",
  receiverEmail: "",
  referenceId: "",
  message: "",
};

export default function HomePage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [step, setStep] = useState<Step>("form");
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

  function validateClient(): boolean {
    const errors: Record<string, string[]> = {};
    if (!form.name.trim()) errors.name = ["Name is required"];
    if (!form.amount.trim()) errors.amount = ["Amount is required"];
    else if (!/^\d+(\.\d{1,8})?$/.test(form.amount))
      errors.amount = ["Amount must be a valid number (up to 8 decimals)"];
    if (!form.receiverEmail.trim())
      errors.receiverEmail = ["Receiver email is required"];
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.receiverEmail))
      errors.receiverEmail = ["Invalid email address"];
    if (!form.referenceId.trim())
      errors.referenceId = ["Reference ID is required"];
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function goToPreview(e: FormEvent) {
    e.preventDefault();
    setFeedback(null);
    if (!validateClient()) return;
    setStep("preview");
  }

  async function handleSend() {
    setFeedback(null);
    setLoading(true);

    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      let data: {
        success?: boolean;
        error?: string;
        code?: string;
        details?: Record<string, string[]>;
        message?: string;
        id?: string;
        retryAfter?: number;
      };

      try {
        data = await res.json();
      } catch {
        setFeedback({
          type: "error",
          text: "Invalid response from server. Please try again.",
        });
        setStep("form");
        return;
      }

      if (!res.ok || !data.success) {
        if (data.details) setFieldErrors(data.details);

        let message = data.error || "Failed to send email";

        if (data.code === "RATE_LIMITED" && data.retryAfter) {
          message = `Too many requests. Please try again in ${data.retryAfter} seconds.`;
        } else if (data.code === "INVALID_RECIPIENT") {
          message = "Invalid recipient email address.";
        } else if (data.code === "CONFIG_ERROR") {
          message = "Server is not configured to send email. Contact support.";
        } else if (data.code === "VALIDATION_ERROR" && data.details) {
          const first = Object.values(data.details)
            .flat()
            .find((m) => typeof m === "string");
          if (first) message = first;
        }

        setFeedback({ type: "error", text: message });
        setStep("form");
        return;
      }

      setFeedback({
        type: "success",
        text: `Email sent successfully (ID: ${data.id || "n/a"}) to ${form.receiverEmail}`,
      });
      setForm(initialForm);
      setStep("form");
    } catch {
      setFeedback({
        type: "error",
        text: "Network error. Please check your connection and try again.",
      });
      setStep("form");
    } finally {
      setLoading(false);
    }
  }

  const subject = `${form.cryptoType} Deposit Successful`;

  return (
    <div className="page">
      <div className="card">
        <h1 className="title">
          {step === "form" ? "Send Crypto Notification" : "Review Email"}
        </h1>
        <p className="subtitle">
          {step === "form"
            ? "Fill the fields below. You will see a final rendered preview before sending."
            : "Confirm the rendered subject and content. No {{variables}} remain."}
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

        {step === "form" ? (
          <form onSubmit={goToPreview} noValidate>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
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
                  placeholder="0.07382054"
                  value={form.amount}
                  onChange={(e) => update("amount", e.target.value)}
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
            </div>

            <div className="form-group">
              <label htmlFor="receiverEmail">Receiver Email</label>
              <input
                id="receiverEmail"
                type="email"
                placeholder="recipient@example.com"
                value={form.receiverEmail}
                onChange={(e) => update("receiverEmail", e.target.value)}
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
            </div>

            <button type="submit" className="btn-primary">
              Review Email →
            </button>
          </form>
        ) : (
          <div className="preview-panel">
            <div className="preview-row">
              <span className="preview-label">To</span>
              <span className="preview-value">{form.receiverEmail}</span>
            </div>
            <div className="preview-row">
              <span className="preview-label">Subject</span>
              <span className="preview-value">{subject}</span>
            </div>

            <div className="preview-body">
              <div className="preview-header">◆ BINANCE</div>
              <h2 className="preview-title">
                {form.cryptoType} Deposit Successful
              </h2>
              <p>
                Your deposit of {form.amount} {form.cryptoType} is now
                available in your <span className="hl">Binance</span> account.
                Log in to check your balance. Read our{" "}
                <span className="hl">FAQs</span> if you are running into
                problems.
              </p>
              <div className="preview-btn">Visit Your Dashboard</div>
              <p className="preview-muted">
                Don&apos;t recognize this activity? Please reset your password
                and contact customer support immediately.
              </p>
              <p className="preview-muted italic">
                This is an automated message, please do not reply.
              </p>
            </div>

            <div className="preview-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setStep("form")}
                disabled={loading}
              >
                ← Back
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleSend}
                disabled={loading}
                aria-busy={loading}
              >
                {loading ? "Sending…" : "Send Email"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
