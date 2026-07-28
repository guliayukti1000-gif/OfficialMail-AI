import { useState } from "react";
import { Send, Plus, X, Loader2, Check, AlertCircle } from "lucide-react";
import { Card, Spinner } from "../components/UI";
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
  const removeRecipient = (index) => setRecipients(recipients.filter((_, i) => i !== index));

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
      updated[index] = { ...updated[index], data: { ...updated[index].data, [field]: value } };
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
    <div className="relative">
      <div className="absolute top-[-100px] left-[10%] w-72 h-72 rounded-full bg-blue-500 opacity-[0.15] blur-3xl animate-[drift_9s_ease-in-out_infinite] pointer-events-none" />
      <div className="absolute bottom-[-80px] right-[5%] w-80 h-80 rounded-full bg-purple-600 opacity-[0.15] blur-3xl animate-[drift_11s_ease-in-out_infinite] pointer-events-none" />

      <div className="relative max-w-4xl">
        <h2 className="font-display font-bold text-2xl text-white mb-1">Bulk Send</h2>
        <p className="text-slate-400 mb-6">Generate and send personalized emails to many recipients at once.</p>

        <Card className="mb-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600" />
          <label className="label-text">Template (use {"{placeholders}"})</label>
          <textarea
            className="input-field font-mono text-sm min-h-[100px] resize-y"
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
          />
          {placeholders.length > 0 && (
            <p className="text-xs text-slate-400 mt-2">Detected placeholders: {placeholders.join(", ")}</p>
          )}
        </Card>

        <Card className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-white">Recipients</h3>
            <button onClick={addRecipient} className="btn-secondary text-sm">
              <Plus size={15} /> Add Recipient
            </button>
          </div>

          <div className="space-y-3">
            {recipients.map((r, index) => (
              <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400">Recipient {index + 1}</span>
                  {recipients.length > 1 && (
                    <button onClick={() => removeRecipient(index)} className="text-xs text-red-400 hover:text-red-300">
                      Remove
                    </button>
                  )}
                </div>
                <input
                  className="input-field mb-2"
                  placeholder="Recipient email address"
                  type="email"
                  value={r.email || ""}
                  onChange={(e) => updateField(index, "email", e.target.value)}
                />
                <div className="grid grid-cols-2 gap-2">
                  {(placeholders.length > 0 ? placeholders : ["name"]).map((key) => (
                    <input
                      key={key}
                      className="input-field"
                      placeholder={key}
                      value={r[key] || ""}
                      onChange={(e) => updateField(index, key, e.target.value)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <button className="btn-primary mb-6" onClick={generateAll} disabled={loading}>
          {loading ? <Spinner /> : <Send size={16} />}
          {loading ? "Generating…" : "Generate All Emails"}
        </button>

        {error && (
          <Card className="mb-6 border-red-500/30 bg-red-500/5">
            <p className="text-sm text-red-400">{error}</p>
          </Card>
        )}

        {results.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-white">Results</h3>
              <button
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium shadow-[0_0_20px_rgba(99,102,241,0.35)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-shadow disabled:opacity-50"
                onClick={sendAll}
                disabled={sendingAll}
              >
                {sendingAll ? "Sending All…" : "Send All"}
              </button>
            </div>

            <div className="space-y-3">
              {results.map((r, i) => (
                <Card
                  key={i}
                  className={`relative overflow-hidden ${r.success ? "" : "border-red-500/30"}`}
                >
                  <div className={`absolute top-0 left-0 right-0 h-1 ${r.success ? "bg-gradient-to-r from-blue-500 to-purple-600" : "bg-red-500"}`} />
                  <div className="flex items-center gap-2 mb-2">
                    <strong className="text-white text-sm">Recipient {i + 1}</strong>
                    <span className="text-xs text-slate-500">({recipients[i]?.email || "no email entered"})</span>
                  </div>

                  {r.success ? (
                    <>
                      <input
                        className="input-field font-medium mb-2"
                        value={r.data?.subject || ""}
                        onChange={(e) => editResultField(i, "subject", e.target.value)}
                        placeholder="Subject"
                      />
                      <textarea
                        className="input-field min-h-[100px] resize-y text-sm"
                        value={r.data?.body || r.data?.email_body || ""}
                        onChange={(e) => editResultField(i, "body", e.target.value)}
                      />
                      <div className="flex items-center gap-3 mt-3">
                        <button
                          onClick={() => sendOne(i)}
                          disabled={!recipients[i]?.email || sendStatus[i] === "sending"}
                          className="btn-secondary text-sm"
                        >
                          {sendStatus[i] === "sending" ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                          {sendStatus[i] === "sending" ? "Sending…" : "Send"}
                        </button>
                        {sendStatus[i] === "sent" && (
                          <span className="flex items-center gap-1 text-xs text-emerald-400">
                            <Check size={14} /> Sent
                          </span>
                        )}
                        {sendStatus[i] === "error" && (
                          <span className="flex items-center gap-1 text-xs text-red-400">
                            <X size={14} /> Failed to send
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    <p className="flex items-center gap-1.5 text-sm text-red-400">
                      <AlertCircle size={14} /> Error: {r.error}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}