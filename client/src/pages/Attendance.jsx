import { useEffect, useState } from "react";
import { api, todayStr } from "../api.js";

export default function Attendance() {
  const [batches, setBatches] = useState([]);
  const [batch, setBatch] = useState("");
  const [date, setDate] = useState(todayStr());
  const [records, setRecords] = useState([]);
  const [saved, setSaved] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api("/students/batches").then(b => { setBatches(b); if (b.length) setBatch(b[0]); });
  }, []);

  useEffect(() => {
    if (!batch) return;
    setMsg("");
    api(`/attendance?batch=${encodeURIComponent(batch)}&date=${date}`).then(d => {
      setRecords(d.records); setSaved(d.saved);
    });
  }, [batch, date]);

  const toggle = id =>
    setRecords(rs => rs.map(r => (r.student._id === id ? { ...r, present: !r.present } : r)));
  const markAll = present => setRecords(rs => rs.map(r => ({ ...r, present })));

  async function save() {
    try {
      await api("/attendance", {
        method: "POST",
        body: { date, batch, records: records.map(r => ({ student: r.student._id, present: r.present })) },
      });
      setSaved(true); setMsg("Attendance saved ✔");
    } catch (e) { setMsg(e.message); }
  }

  const present = records.filter(r => r.present).length;

  if (!batches.length) {
    return (<><h1>Attendance</h1><p className="muted">Add students with a batch first.</p></>);
  }

  return (
    <>
      <header className="page-head">
        <div><h1>Attendance</h1><p className="muted">{present}/{records.length} present {saved && "· saved"}</p></div>
        <div className="row-actions">
          <select value={batch} onChange={e => setBatch(e.target.value)}>
            {batches.map(b => <option key={b}>{b}</option>)}
          </select>
          <input type="date" value={date} max={todayStr()} onChange={e => setDate(e.target.value)} />
        </div>
      </header>

      <div className="row-actions" style={{ marginBottom: 16 }}>
        <button className="btn small ghost" onClick={() => markAll(true)}>All present</button>
        <button className="btn small ghost" onClick={() => markAll(false)}>All absent</button>
      </div>

      <div className="att-grid">
        {records.map(r => (
          <button key={r.student._id} className={`card att ${r.present ? "present" : ""}`} onClick={() => toggle(r.student._id)}>
            <span className="att-dot">{r.present ? "✓" : ""}</span>
            {r.student.name}
          </button>
        ))}
      </div>

      <div className="save-bar">
        {msg && <span className="muted">{msg}</span>}
        <button className="btn primary" onClick={save}>Save attendance</button>
      </div>
    </>
  );
}
