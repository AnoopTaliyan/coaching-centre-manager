import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  api, auth, downloadCSV, modeLabel, monthLabel, monthStr, rupees, whatsappReminder, whatsappThanks,
} from "../api.js";

const TABS = [["due", "Pending"], ["paid", "Paid"], ["all", "All"], ["history", "Payments"]];

export default function Fees() {
  const [month, setMonth] = useState(monthStr());
  const [rows, setRows] = useState([]);
  const [payments, setPayments] = useState([]);
  const [filter, setFilter] = useState("due");
  const [paying, setPaying] = useState(null);
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("cash");
  const [note, setNote] = useState("");
  const [done, setDone] = useState(null); // last recorded payment, for receipt/WhatsApp shortcuts
  const [error, setError] = useState("");

  const load = () =>
    Promise.all([api(`/payments/status?month=${month}`), api(`/payments?month=${month}`)])
      .then(([status, list]) => { setRows(status); setPayments(list); })
      .catch(e => setError(e.message));
  useEffect(() => { setDone(null); load(); }, [month]); // eslint-disable-line react-hooks/exhaustive-deps

  const centreName = auth.user?.centreName || "";
  const shown = rows.filter(r => (filter === "due" ? r.due > 0 : filter === "paid" ? r.due === 0 : true));
  const totalDue = rows.reduce((a, r) => a + r.due, 0);
  const totalCollected = payments.reduce((a, p) => a + p.amount, 0);

  async function record(e) {
    e.preventDefault();
    setError("");
    try {
      const p = await api("/payments", {
        method: "POST",
        body: { student: paying.student._id, amount: Number(amount), month, mode, note: note || undefined },
      });
      setDone({ ...p, student: paying.student });
      setPaying(null); setAmount(""); setNote(""); setMode("cash");
      load();
    } catch (err) { setError(err.message); }
  }

  async function removePayment(p) {
    if (!confirm(`Delete ${rupees(p.amount)} payment of ${p.student?.name || "this student"}?`)) return;
    try { await api(`/payments/${p._id}`, { method: "DELETE" }); load(); }
    catch (err) { setError(err.message); }
  }

  function exportCSV() {
    if (filter === "history") {
      downloadCSV(`payments-${month}.csv`, ["Receipt", "Date", "Student", "Batch", "Amount", "Mode", "Note"],
        payments.map(p => [p.receiptNo, new Date(p.paidOn).toLocaleDateString("en-IN"), p.student?.name,
          p.student?.batch, p.amount, modeLabel(p.mode), p.note]));
    } else {
      downloadCSV(`fees-${month}.csv`, ["Student", "Batch", "Parent phone", "Fee", "Paid", "Due"],
        rows.map(r => [r.student.name, r.student.batch, r.student.parentPhone || r.student.phone,
          r.fee, r.paid, r.due]));
    }
  }

  const thanks = done && whatsappThanks({
    student: done.student, amount: done.amount, month: done.month, receiptNo: done.receiptNo, centreName,
  });

  return (
    <>
      <header className="page-head">
        <div>
          <h1>Fees</h1>
          <p className="muted">{monthLabel(month)} · {rupees(totalDue)} pending · {rupees(totalCollected)} collected</p>
        </div>
        <div className="row-actions">
          <input type="month" value={month} onChange={e => setMonth(e.target.value)} />
          <button className="btn ghost" onClick={exportCSV}>Export Excel</button>
        </div>
      </header>

      <div className="tabs">
        {TABS.map(([k, l]) => (
          <button key={k} className={`tab ${filter === k ? "active" : ""}`} onClick={() => setFilter(k)}>{l}</button>
        ))}
      </div>

      {error && <div className="alert" style={{ marginBottom: 16 }}>{error}</div>}

      {done && (
        <div className="card success-bar">
          <span>✔ {rupees(done.amount)} received from <strong>{done.student.name}</strong> · {done.receiptNo}</span>
          <div className="row-actions">
            <Link className="btn small primary" to={`/receipt/${done._id}`}>Receipt / PDF</Link>
            {thanks && <a className="btn small ghost" href={thanks} target="_blank" rel="noreferrer">Send on WhatsApp</a>}
            <button className="btn small ghost" onClick={() => setDone(null)}>✕</button>
          </div>
        </div>
      )}

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
          <label>Note (optional)<input value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. UPI ref no." /></label>
          <div className="row-actions">
            <button className="btn primary">Save payment</button>
            <button type="button" className="btn ghost" onClick={() => setPaying(null)}>Cancel</button>
          </div>
        </form>
      )}

      {filter === "history" ? (
        <div className="card table-wrap">
          <table>
            <thead><tr><th>Receipt</th><th>Date</th><th>Student</th><th>Amount</th><th>Mode</th><th></th></tr></thead>
            <tbody>
              {payments.map(p => (
                <tr key={p._id}>
                  <td><span className="pill">{p.receiptNo}</span></td>
                  <td>{new Date(p.paidOn).toLocaleDateString("en-IN")}</td>
                  <td><strong>{p.student?.name || "—"}</strong> <small className="muted">{p.student?.batch}</small></td>
                  <td className="ok">{rupees(p.amount)}</td>
                  <td>{modeLabel(p.mode)}</td>
                  <td className="right">
                    <Link className="btn small ghost" to={`/receipt/${p._id}`}>Receipt</Link>
                    <button className="btn small ghost danger" onClick={() => removePayment(p)}>Delete</button>
                  </td>
                </tr>
              ))}
              {!payments.length && <tr><td colSpan="6" className="empty">No payments recorded for this month yet.</td></tr>}
            </tbody>
          </table>
        </div>
      ) : (
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
                        <button className="btn small primary" onClick={() => { setPaying(r); setAmount(String(r.due)); setDone(null); }}>
                          Collect
                        </button>
                      )}
                      {wa && <a className="btn small ghost" href={wa} target="_blank" rel="noreferrer">Remind on WhatsApp</a>}
                    </td>
                  </tr>
                );
              })}
              {!shown.length && <tr><td colSpan="6" className="empty">Nothing here 🎉</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
