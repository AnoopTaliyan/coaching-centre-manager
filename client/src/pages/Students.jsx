import { useEffect, useState } from "react";
import { api, rupees } from "../api.js";

const empty = { name: "", phone: "", parentPhone: "", batch: "", monthlyFee: "" };

export default function Students() {
  const [students, setStudents] = useState([]);
  const [q, setQ] = useState("");
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  const load = () =>
    api(`/students?active=true${q ? `&q=${encodeURIComponent(q)}` : ""}`).then(setStudents).catch(e => setError(e.message));

  useEffect(() => { load(); }, [q]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = k => e => setForm({ ...form, [k]: e.target.value });

  function startAdd() { setForm(empty); setEditing(null); setOpen(true); setError(""); }
  function startEdit(s) {
    setForm({ name: s.name, phone: s.phone || "", parentPhone: s.parentPhone || "", batch: s.batch, monthlyFee: s.monthlyFee });
    setEditing(s._id); setOpen(true); setError("");
  }

  async function save(e) {
    e.preventDefault();
    try {
      const body = { ...form, monthlyFee: Number(form.monthlyFee) };
      if (editing) await api(`/students/${editing}`, { method: "PUT", body });
      else await api("/students", { method: "POST", body });
      setOpen(false); load();
    } catch (err) { setError(err.message); }
  }

  async function remove(s) {
    if (!confirm(`Remove ${s.name}? Their payment history will be kept.`)) return;
    await api(`/students/${s._id}`, { method: "DELETE" });
    load();
  }

  return (
    <>
      <header className="page-head">
        <div><h1>Students</h1><p className="muted">{students.length} active</p></div>
        <button className="btn primary" onClick={startAdd}>+ Add student</button>
      </header>

      <input className="search" placeholder="Search by name…" value={q} onChange={e => setQ(e.target.value)} />

      {open && (
        <form className="card form-grid" onSubmit={save}>
          <h3>{editing ? "Edit student" : "New student"}</h3>
          <label>Name<input value={form.name} onChange={set("name")} required /></label>
          <label>Batch<input value={form.batch} onChange={set("batch")} placeholder="e.g. Class 10 - Morning" required /></label>
          <label>Monthly fee (₹)<input type="number" min="0" value={form.monthlyFee} onChange={set("monthlyFee")} required /></label>
          <label>Student phone<input value={form.phone} onChange={set("phone")} /></label>
          <label>Parent phone (for reminders)<input value={form.parentPhone} onChange={set("parentPhone")} /></label>
          {error && <div className="alert">{error}</div>}
          <div className="row-actions">
            <button className="btn primary">Save</button>
            <button type="button" className="btn ghost" onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="card table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Batch</th><th>Fee</th><th>Parent phone</th><th></th></tr></thead>
          <tbody>
            {students.map(s => (
              <tr key={s._id}>
                <td><strong>{s.name}</strong></td>
                <td><span className="pill">{s.batch}</span></td>
                <td>{rupees(s.monthlyFee)}</td>
                <td>{s.parentPhone || s.phone || <span className="muted">—</span>}</td>
                <td className="right">
                  <button className="btn small ghost" onClick={() => startEdit(s)}>Edit</button>
                  <button className="btn small ghost danger" onClick={() => remove(s)}>Remove</button>
                </td>
              </tr>
            ))}
            {!students.length && <tr><td colSpan="5" className="empty">No students yet. Add your first one!</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
