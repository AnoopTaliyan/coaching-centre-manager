import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { auth } from "../api.js";

const links = [
  { to: "/", label: "Dashboard", icon: "📊" },
  { to: "/students", label: "Students", icon: "👨‍🎓" },
  { to: "/fees", label: "Fees", icon: "💰" },
  { to: "/attendance", label: "Attendance", icon: "✅" },
];

export default function Layout() {
  const nav = useNavigate();
  const user = auth.user;
  const logout = () => { auth.clear(); nav("/login"); };

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">CC</span>
          <div>
            <strong>{user?.centreName || "My Centre"}</strong>
            <small>Coaching Manager</small>
          </div>
        </div>
        <nav>
          {links.map(l => (
            <NavLink key={l.to} to={l.to} end={l.to === "/"} className="navlink">
              <span>{l.icon}</span> {l.label}
            </NavLink>
          ))}
        </nav>
        <button className="btn ghost logout" onClick={logout}>Log out</button>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
