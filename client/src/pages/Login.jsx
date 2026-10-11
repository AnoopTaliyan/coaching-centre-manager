import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, auth } from "../api.js";

export default function Login() {
  const nav = useNavigate();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ centreName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = k => e => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError(""); setBusy(true);
    try {
      const data = await api(`/auth/${mode}`, { method: "POST", body: form });
      auth.save(data);
      nav("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={submit}>
        <span className="brand-mark big">CC</span>
        <h1>{mode === "login" ? "Welcome back" : "Register your centre"}</h1>
        <p className="muted">Students, fees and attendance — all in one place.</p>

        {mode === "register" && (
          <label>Centre name
            <input value={form.centreName} onChange={set("centreName")} placeholder="Sharma Classes" required />
          </label>
        )}
        <label>Email
          <input type="email" value={form.email} onChange={set("email")} required />
        </label>
        <label>Password
          <input type="password" value={form.password} onChange={set("password")} minLength={6} required />
        </label>

        {error && <div className="alert">{error}</div>}
        <button className="btn primary" disabled={busy}>
          {busy ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
        </button>
        <button type="button" className="link" onClick={() => setMode(mode === "login" ? "register" : "login")}>
          {mode === "login" ? "New centre? Register here" : "Already registered? Log in"}
        </button>
      </form>
    </div>
  );
}
