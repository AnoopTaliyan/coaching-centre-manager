// Dates in the centre's local time zone (default India), not UTC.
// Without this, a payment recorded before 5:30 AM IST would land on the previous day/month.
const TZ = process.env.TIMEZONE || "Asia/Kolkata";
const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });

export const today = () => fmt.format(new Date()); // YYYY-MM-DD
export const currentMonth = () => today().slice(0, 7); // YYYY-MM
