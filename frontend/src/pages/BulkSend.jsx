import { useState } from "react";

export default function BulkSend() {
  const [template, setTemplate] = useState(
    "Hi {name}, your invoice #{invoice_no} of ₹{amount} is due on {due_date}."
  );
  const [recipients, setRecipients] = useState([{}]);

  // Extract {placeholders} from the template text
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

  const generateAll = async () => {
    setLoading(true);
    setResults([]);
    setError("");
    try {
      const payload = {
        requests: recipients.map((r) => ({
          purpose: "General",
          recipient_name: r.name || "",
          key_points: template.replace(/{(.*?)}/g, (_, key) => r[key] || ""),
        })),
      };
      const res = await fetch("http://localhost:8000/api/generate-email-bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Server responded with status ${res.status}`);
      }

      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      setError(err.message || "Something went wrong while generating emails.");
    } finally {
      setLoading(false);
    }
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
            <h2 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>Results</h2>
            {results.map((r, i) => (
              <div
                key={i}
                style={{
                  background: "#1a1a1a",
                  border: `1px solid ${r.success ? "#16a34a" : "#ef4444"}`,
                  borderRadius: "8px",
                  padding: "1rem",
                  marginBottom: "0.75rem",
                  whiteSpace: "pre-wrap",
                }}
              >
                <strong>Recipient {i + 1}:</strong>{" "}
                {r.success ? (r.data?.email_body || JSON.stringify(r.data)) : `Error: ${r.error}`}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}