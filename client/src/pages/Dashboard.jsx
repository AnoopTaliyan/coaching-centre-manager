import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, monthLabel, monthStr, rupees, todayStr } from "../api.js";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api(`/dashboard?month=${monthStr()}&date=${todayStr()}`).then(setData).catch(e => setError(e.message));
  }, []);

  if (error) return <div className="alert">{error}</div>;
  if (!data) return <p className="muted">Loading…</p>;

  const pct = data.expected ? Math.round((data.collected / data.expected) * 100) : 0;

  return (
    <>
      <header className="page-head">
        <div>
          <h1>Dashboard</h1>
          <p className="muted">{monthLabel(data.month)}</p>
        </div>
        <Link to="/students" className="btn primary">+ Add student</Link>
      </header>

      <div className="stats">
        <div className="card stat"><small>Active students</small><strong>{data.activeStudents}</strong></div>
        <div className="card stat"><small>Collected</small><strong className="ok">{rupees(data.collected)}</strong>
          <div className="bar"><span style={{ width: pct + "%" }} /></div>
          <small className="muted">{pct}% of {rupees(data.expected)}</small>
        </div>
        <div className="card stat"><small>Pending</small><strong className="bad">{rupees(data.pending)}</strong>
          <small className="muted">{data.defaulters} students</small>
        </div>
        <div className="card stat"><small>Attendance today</small>
          <strong>{data.attendanceToday ? data.attendanceToday.percent + "%" : "—"}</strong>
          <small className="muted">
            {data.attendanceToday
              ? `${data.attendanceToday.present}/${data.attendanceToday.marked} present`
              : "Not marked yet"}
          </small>
        </div>
      </div>

      <div className="quick">
        <Link to="/fees" className="card quick-card">💰 <div><strong>Collect fees</strong><small>Record payments & send reminders</small></div></Link>
        <Link to="/attendance" className="card quick-card">✅ <div><strong>Mark attendance</strong><small>Today's batches</small></div></Link>
      </div>
    </>
  );
}
