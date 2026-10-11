const BASE = (import.meta.env.VITE_API_URL || "") + "/api";

export const auth = {
  get token() { return localStorage.getItem("ccm_token"); },
  get user() {
    try { return JSON.parse(localStorage.getItem("ccm_user")); } catch { return null; }
  },
  save({ token, user }) {
    localStorage.setItem("ccm_token", token);
    localStorage.setItem("ccm_user", JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem("ccm_token");
    localStorage.removeItem("ccm_user");
  },
};

export async function api(path, { method = "GET", body } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(auth.token ? { Authorization: `Bearer ${auth.token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && auth.token) {
    auth.clear();
    window.location.href = "/login";
  }
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

// Local-date helpers (India time, not UTC)
const pad = n => String(n).padStart(2, "0");
export const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
export const monthStr = () => todayStr().slice(0, 7);
export const rupees = n => "₹" + Number(n || 0).toLocaleString("en-IN");

export const monthLabel = m =>
  new Date(m + "-01").toLocaleDateString("en-IN", { month: "long", year: "numeric" });

// WhatsApp link with a pre-filled fee reminder (no API key needed)
export function whatsappReminder({ student, due, month, centreName }) {
  const phone = (student.parentPhone || student.phone || "").replace(/\D/g, "");
  if (!phone) return null;
  const number = phone.length === 10 ? "91" + phone : phone;
  const text =
    `Namaste! ${student.name} ki ${monthLabel(month)} ki fees ${rupees(due)} abhi pending hai. ` +
    `Kripya jald jama karein. Dhanyavaad – ${centreName}`;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
