import { useEffect, useState } from "react";
import { api, auth, monthLabel, monthStr, rupees, whatsappReminder } from "../api.js";

export default function Fees() {
  const [month, setMonth] = useState(monthStr());
  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState("due");
  const [paying, setPaying] = useState(null);
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("cash");
  const [error, setError] = useState("");

  const load = () => api(`/payments/status?month=${month}`).then(setRows).catch(e => setError(e.message));
  useEffect(() => { load(); }, [month]); // eslint-disable-line react-hooks/exhaustive-deps

  const shown = rows.filter(r => (filter === "due" ? r.due > 0 : filter === "paid" ? r.due === 0 : true));
  const totalDue = rows.reduce((a, r) => a + r.due, 0);

  async function record(e) {
    e.preventDefault();
    try {
      await api("/payments", { method: "POST", body: { student: paying.student._id, amount: Number(amount), month, mode } });
      setPaying(null); setAmount(""); load();
    } catch (err) { setError(err.message); }
  }

  const centreName = auth.user?.centreName || "";

  return (
    <>
      <header className="page-head">
        <div><h1>Fees</h1><p className="muted">{monthLabel(month)} · {rupees(totalDue)} pending</p></div>
        <input type="month" value={month} onChange={e => setMonth(e.target.value)} />
      </header>

      <div className="tabs">
        {[["due", "Pending"], ["paid", "Paid"], ["all", "All"]].map(([k, l]) => (
          <button key={k} className={`tab ${filter === k ? "active" : ""}`} onClick={() => setFilter(k)}>{l}</button>
        ))}
      </div>

      {error && <div className="alert">{error}</div>}

      {paying && (
        <form className="card form-grid" onSubmit={record}>
          <h3>Record payment — {paying.student.name}</h3>
          <label>Amount (₹)<input type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)} required autoFocus /></label>
          <label>Mode
            <select value={mode} onChange={e => setMode(e.target.value)}>
              <option value="cash">Cash</option><option value="upi">UPI</option>
              <option value="bank">Bank</option><option value="other">Other</option>
            </select>
          </label>
          <div className="row-actions">
            <button className="btn primary">Save payment</button>
            <button type="button" className="btn ghost" onClick={() => setPaying(null)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="card table-wrap">
        <table>
          <thead><tr><th>Student</th><th>Batch</th><th>Fee</th><th>Paid</th><th>Due</th><th></th></tr></thead>
          <tbody>
            {shown.map(r => {
              const wa = r.due > 0 ? whatsappReminder({ student: r.student, due: r.due, month, centreName }) : null;
              return (
                <tr key={r.student._id}>
                  <td><strong>{r.student.name}</strong></td>
                  <td><span className="pill">{r.student.batch}</span></td>
                  <td>{rupees(r.fee)}</td>
                  <td className="ok">{rupees(r.paid)}</td>
                  <td>{r.due > 0 ? <span className="bad">{rupees(r.due)}</span> : <span className="pill ok-pill">Paid</span>}</td>
                  <td className="right">
                    {r.due > 0 && (
                      <button className="btn small primary" onClick={() => { setPaying(r); setAmount(String(r.due)); }}>
                        Collect
                      </button>
                    )}
                    {wa && <a className="btn small ghost" href={wa} target="_blank" rel="noreferrer">WhatsApp</a>}
                  </td>
                </tr>
              );
            })}
            {!shown.length && <tr><td colSpan="6" className="empty">Nothing here 🎉</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
