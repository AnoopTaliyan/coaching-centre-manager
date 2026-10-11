# 📚 Coaching Centre Manager

A full-stack web app that replaces registers and Excel for coaching & tuition centres.

**Built by [Anoop Kumar](https://github.com/AnoopTaliyan)**

## Features

- 🔐 **Login per centre** — each coaching centre sees only its own data
- 👨‍🎓 **Students** — add, edit, search; organise by batch; set monthly fee
- 💰 **Fees** — see who has paid and who hasn't for any month, record cash/UPI payments, partial payments supported
- 📲 **WhatsApp reminders** — one click opens WhatsApp with a ready fee-reminder message to the parent
- ✅ **Attendance** — tap-to-mark per batch per day, edit past days
- 📊 **Dashboard** — collected vs pending this month, defaulters, today's attendance

## Tech stack

| Layer    | Tech |
|----------|------|
| Frontend | React 18, React Router, Vite |
| Backend  | Node.js, Express |
| Database | MongoDB (Mongoose) |
| Auth     | JWT + bcrypt |

## Run locally

You need **Node.js 18+** and a free **MongoDB Atlas** database (mongodb.com/atlas → create free cluster → copy connection string).

```bash
# 1. Backend
cd server
cp .env.example .env      # then put your MONGO_URI and a JWT_SECRET in .env
npm install
npm run dev               # API on http://localhost:5000

# 2. Frontend (new terminal)
cd client
npm install
npm run dev               # App on http://localhost:5173
```

Open http://localhost:5173, register your centre, and start adding students.

## API

| Method | Endpoint | What it does |
|--------|----------|--------------|
| POST | `/api/auth/register` | Create centre account |
| POST | `/api/auth/login` | Log in, returns JWT |
| GET/POST | `/api/students` | List (`?batch`, `?q`, `?active`) / add |
| PUT/DELETE | `/api/students/:id` | Edit / deactivate |
| GET | `/api/students/batches` | List of batch names |
| GET | `/api/payments/status?month=YYYY-MM` | Fee, paid and due per student |
| GET/POST | `/api/payments` | Payment history / record payment |
| GET/POST | `/api/attendance?batch=&date=` | Get / save a day's attendance |
| GET | `/api/attendance/student/:id` | Attendance % for one student |
| GET | `/api/dashboard` | Summary numbers |

## Deploy (free)

- **Backend → Render**: New Web Service, root `server`, build `npm install`, start `npm start`. Add env vars `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` (your frontend URL).
- **Frontend → Netlify or Vercel**: root `client`, build `npm run build`, publish `dist`. Add env var `VITE_API_URL` = your Render URL. (A `_redirects` file is already included so page refreshes work on Netlify.)

## Roadmap

- [ ] Fee receipts as PDF
- [ ] Monthly reports & export to Excel
- [ ] Student attendance history page
- [ ] Automatic WhatsApp reminders via WhatsApp Business API
