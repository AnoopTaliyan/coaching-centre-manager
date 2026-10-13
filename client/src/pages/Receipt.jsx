import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, auth, modeLabel, monthLabel, rupees, whatsappThanks } from "../api.js";

// Printable fee receipt. "Download PDF" uses the browser's print dialog
// (Save as PDF), so it works on phones and laptops with no extra library.
export default function Receipt() {
  const { id } = useParams();
  const [p, setP] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api(`/payments/${id}`).then(setP).catch(e => setError(e.message));
  }, [id]);

  useEffect(() => {
    if (p) document.title = `Receipt ${p.receiptNo} – ${p.student?.name || ""}`;
    return () => { document.title = "Coaching Centre Manager"; };
  }, [p]);

  if (error) return <div className="receipt-page"><div className="alert">{error}</div></div>;
  if (!p) return <div className="receipt-page"><p className="muted">Loading…</p></div>;

  const centreName = p.centre?.centreName || auth.user?.centreName || "";
  const student = p.student || { name: "(removed student)" };
  const wa = p.student && whatsappThanks({ student, amount: p.amount, month: p.month, receiptNo: p.receiptNo, centreName });
  const paidOn = new Date(p.paidOn).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="receipt-page">
      <div className="receipt-actions no-print">
        <Link to="/fees" className="btn ghost">← Back</Link>
        <div className="row-actions">
          {wa && <a className="btn ghost" href={wa} target="_blank" rel="noreferrer">Send on WhatsApp</a>}
          <button className="btn primary" onClick={() => window.print()}>Download PDF</button>
        </div>
      </div>

      <article className="card receipt">
        <header className="receipt-head">
          <div>
            <span className="brand-mark">CC</span>
            <h2>{centreName}</h2>
            {p.centre?.email && <small className="muted">{p.centre.email}</small>}
          </div>
          <div className="receipt-meta">
            <strong>FEE RECEIPT</strong>
            <span>No. {p.receiptNo}</span>
            <span>{paidOn}</span>
          </div>
        </header>

        <dl className="receipt-grid">
          <dt>Student</dt><dd>{student.name}</dd>
          <dt>Batch</dt><dd>{student.batch || "—"}</dd>
          <dt>Fee for</dt><dd>{monthLabel(p.month)}</dd>
          <dt>Payment mode</dt><dd>{modeLabel(p.mode)}</dd>
          {p.note && (<><dt>Note</dt><dd>{p.note}</dd></>)}
        </dl>

        <div className="receipt-total">
          <span>Amount received</span>
          <strong>{rupees(p.amount)}</strong>
        </div>

        <footer className="receipt-foot">
          <small className="muted">This is a computer-generated receipt.</small>
          <div className="sign">Authorised signature</div>
        </footer>
      </article>
    </div>
  );
}
