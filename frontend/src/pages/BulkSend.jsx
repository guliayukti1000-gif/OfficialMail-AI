import { useState } from "react";
import { generateEmailBulk, sendBulkEmail } from "../api";

export default function BulkSend() {
  const [template, setTemplate] = useState(
    "Hi {name}, your invoice #{invoice_no} of ₹{amount} is due on {due_date}."
  );
  const [recipients, setRecipients] = useState([{}]);

  const placeholders = [...template.matchAll(/{(.*?)}/g)].map((m) => m[1]);

  const updateField = (index, key, value) => {
    const updated = [...recipients];
    updated[index] = { ...updated[index], [key]: value };
    setRecipients(updated);
  };

  const addRecipient = () => setRecipients([...recipients, {}]);

  const removeRecipient = (index) =>
    setRecipients(recipients.filter((_, i) => i !== index));

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sendStatus, setSendStatus] = useState({});
  const [sendingAll, setSendingAll] = useState(false);

  const generateAll = async () => {
    setLoading(true);
    setResults([]);
    setError("");
    setSendStatus({});
    try {
      const payload = {
        requests: recipients.map((r) => ({
          purpose: "General",
          recipient_name: r.name || "",
          key_points: template.replace(/{(.*?)}/g, (_, key) => r[key] || ""),
        })),
      };
      const data = await generateEmailBulk(payload);
      setResults(data.results || []);
    } catch (err) {
      setError(err.message || "Something went wrong while generating emails.");
    } finally {
      setLoading(false);
    }
  };

  const editResultField = (index, field, value) => {
    const updated = [...results];
    if (updated[index].data) {
      updated[index] = {
        ...updated[index],
        data: { ...updated[index].data, [field]: value },
      };
      setResults(updated);
    }
  };

  const sendOne = async (index) => {
    const r = results[index];
    const recipient = recipients[index];
    if (!r?.success || !recipient?.email) return;

    setSendStatus((s) => ({ ...s, [index]: "sending" }));
    try {
      const data = await sendBulkEmail({
        emails: [
          {
            to: recipient.email,
            subject: r.data?.subject || "Email from OfficialMail AI",
            body: r.data?.body || r.data?.email_body || "",
          },
        ],
      });
      const ok = data.results?.[0]?.success;
      setSendStatus((s) => ({ ...s, [index]: ok ? "sent" : "error" }));
    } catch {
      setSendStatus((s) => ({ ...s, [index]: "error" }));
    }
  };

  const sendAll = async () => {
    setSendingAll(true);
    const emailsToSend = results
      .map((r, index) => ({ r, index }))
      .filter(({ r, index }) => r.success && recipients[index]?.email);

    for (const { index } of emailsToSend) {
      await sendOne(index);
    }
    setSendingAll(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d0d", color: "#f5f5f5", padding: "2rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "1.75rem", marginBottom: "1rem" }}>Bulk Email Sender</h1>

        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
            Template (use {"{placeholders}"})
          </label>
          <textarea
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            rows={4}
            style={{
              width: "100%",
              background: "#1a1a1a",
              color: "#f5f5f5",
              border: "1px solid #333",
              borderRadius: "8px",
              padding: "0.75rem",
              fontFamily: "monospace",
              fontSize: "0.95rem",
              resize: "vertical",
            }}
          />
          {placeholders.length > 0 && (
            <p style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "#999" }}>
              Detected placeholders: {placeholders.join(", ")}
            </p>
          )}
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <h2 style={{ fontSize: "1.1rem" }}>Recipients</h2>
            <button
              onClick={addRecipient}
              style={{
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                padding: "0.5rem 1rem",
                cursor: "pointer",
              }}
            >
              + Add Recipient
            </button>
          </div>

          {recipients.map((r, index) => (
            <div
              key={index}
              style={{
                background: "#1a1a1a",
                border: "1px solid #333",
                borderRadius: "8px",
                padding: "1rem",
                marginBottom: "0.75rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.85rem", color: "#999" }}>Recipient {index + 1}</span>
                {recipients.length > 1 && (
                  <button
                    onClick={() => removeRecipient(index)}
                    style={{
                      background: "transparent",
                      color: "#ef4444",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>

              <input
                placeholder="Recipient email address"
                value={r.email || ""}
                onChange={(e) => updateField(index, "email", e.target.value)}
                type="email"
                style={{
                  width: "100%",
                  background: "#0d0d0d",
                  color: "#f5f5f5",
                  border: "1px solid #2563eb",
                  borderRadius: "6px",
                  padding: "0.5rem",
                  marginBottom: "0.5rem",
                }}
              />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                {(placeholders.length > 0 ? placeholders : ["name"]).map((key) => (
                  <input
                    key={key}
                    placeholder={key}
                    value={r[key] || ""}
                    onChange={(e) => updateField(index, key, e.target.value)}
                    style={{
                      background: "#0d0d0d",
                      color: "#f5f5f5",
                      border: "1px solid #333",
                      borderRadius: "6px",
                      padding: "0.5rem",
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={generateAll}
          disabled={loading}
          style={{
            background: loading ? "#444" : "#16a34a",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "0.75rem 1.5rem",
            fontSize: "1rem",
            cursor: loading ? "not-allowed" : "pointer",
            marginBottom: "1.5rem",
          }}
        >
          {loading ? "Generating..." : "Generate All Emails"}
        </button>

        {error && (
          <div
            style={{
              background: "#3f1d1d",
              border: "1px solid #ef4444",
              color: "#fecaca",
              borderRadius: "8px",
              padding: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            {error}
          </div>
        )}

        {results.length > 0 && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <h2 style={{ fontSize: "1.1rem" }}>Results</h2>
              <button
                onClick={sendAll}
                disabled={sendingAll}
                style={{
                  background: sendingAll ? "#444" : "#7c3aed",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "0.5rem 1rem",
                  cursor: sendingAll ? "not-allowed" : "pointer",
                }}
              >
                {sendingAll ? "Sending All..." : "Send All"}
              </button>
            </div>

            {results.map((r, i) => (
              <div
                key={i}
                style={{
                  background: "#1a1a1a",
                  border: `1px solid ${r.success ? "#16a34a" : "#ef4444"}`,
                  borderRadius: "8px",
                  padding: "1rem",
                  marginBottom: "0.75rem",
                }}
              >
                <strong>Recipient {i + 1}</strong>{" "}
                <span style={{ fontSize: "0.85rem", color: "#999" }}>
                  ({recipients[i]?.email || "no email entered"})
                </span>

                {r.success ? (
                  <>
                    <textarea
                      value={r.data?.subject || ""}
                      onChange={(e) => editResultField(i, "subject", e.target.value)}
                      placeholder="Subject"
                      rows={1}
                      style={{
                        width: "100%",
                        marginTop: "0.5rem",
                        background: "#0d0d0d",
                        color: "#f5f5f5",
                        border: "1px solid #333",
                        borderRadius: "6px",
                        padding: "0.5rem",
                        fontWeight: 600,
                      }}
                    />
                    <textarea
                      value={r.data?.body || r.data?.email_body || ""}
                      onChange={(e) => editResultField(i, "body", e.target.value)}
                      rows={4}
                      style={{
                        width: "100%",
                        marginTop: "0.5rem",
                        background: "#0d0d0d",
                        color: "#f5f5f5",
                        border: "1px solid #333",
                        borderRadius: "6px",
                        padding: "0.5rem",
                        resize: "vertical",
                      }}
                    />

                    <div style={{ marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <button
                        onClick={() => sendOne(i)}
                        disabled={!recipients[i]?.email || sendStatus[i] === "sending"}
                        style={{
                          background: !recipients[i]?.email ? "#444" : "#2563eb",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          padding: "0.4rem 1rem",
                          cursor: !recipients[i]?.email ? "not-allowed" : "pointer",
                        }}
                      >
                        {sendStatus[i] === "sending" ? "Sending..." : "Send"}
                      </button>

                      {sendStatus[i] === "sent" && (
                        <span style={{ color: "#16a34a", fontSize: "0.85rem" }}>✓ Sent</span>
                      )}
                      {sendStatus[i] === "error" && (
                        <span style={{ color: "#ef4444", fontSize: "0.85rem" }}>✗ Failed to send</span>
                      )}
                    </div>
                  </>
                ) : (
                  <p style={{ color: "#fecaca", marginTop: "0.5rem" }}>Error: {r.error}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}