# 📚 Coaching Centre Manager

**Registers aur Excel ki jagah ek simple app.** Coaching and tuition centres can manage students, fees and attendance from a phone or laptop.

Built by **[Anoop Kumar](https://github.com/AnoopTaliyan)** · React · Node.js · Express · MongoDB

> 🔗 **Live demo:** _coming soon_
> 📸 Screenshots: _add to `docs/` and link here_

---

## Why

Most small coaching centres still track fees in a notebook. That means missed dues, awkward reminder calls and no record of who paid what. This app fixes that:

- See **who hasn't paid this month** in one tap
- Send a **WhatsApp reminder** to the parent with one click, message already written
- Give a **proper receipt (PDF)** for every payment
- Mark **attendance** for a whole batch in seconds

## Features

| | Feature | Details |
|---|---|---|
| 🔐 | **Login per centre** | Each centre sees only its own data (JWT auth, bcrypt-hashed passwords) |
| 👨‍🎓 | **Students** | Add, edit, search, group by batch, set monthly fee. Removing a student keeps their payment history |
| 💰 | **Fees** | Pending / paid / all for any month, cash/UPI/bank, partial payments, notes |
| 🧾 | **Receipts (PDF)** | Every payment gets a receipt number (e.g. `R-4F2A9C`) and a printable receipt. "Download PDF" uses the browser's Save as PDF |
| 📲 | **WhatsApp** | One-click fee reminder for dues, and a "fees received" message with the receipt number after payment. No API key needed |
| 📜 | **Payment history** | All payments of a month, open the receipt again or delete a wrong entry |
| 📥 | **Export to Excel** | Download the month's fee status or payment list as CSV |
| ✅ | **Attendance** | Tap-to-mark per batch per day, "all present" shortcut, edit past days |
| 📊 | **Dashboard** | Collected vs pending this month, defaulters, today's attendance |
| 📱 | **Mobile friendly** | Works on phones; light and dark mode |

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 18, React Router, Vite |
| Backend | Node.js, Express |
| Database | MongoDB (Mongoose) |
| Auth | JWT + bcrypt |
| Hosting | Netlify (frontend) + Render (API) + MongoDB Atlas, all on free plans |

## Project structure

```
coaching-centre-manager/
├── client/              React app (Vite)
│   └── src/
│       ├── pages/       Dashboard, Students, Fees, Attendance, Receipt, Login
│       ├── components/  Layout (sidebar)
│       └── api.js       API client + WhatsApp/CSV helpers
├── server/              Express API
│   └── src/
│       ├── models/      User, Student, Payment, Attendance
│       ├── routes/      auth, students, payments, attendance, dashboard
│       ├── middleware/  JWT auth
│       └── utils/       India-time date helpers
├── render.yaml          One-click API deploy on Render
└── netlify.toml         Frontend deploy on Netlify
```

## Run locally

You need **Node.js 18+** and a free **MongoDB Atlas** database (mongodb.com/atlas → create a free cluster → Connect → copy the connection string).

```bash
# 1. Backend
cd server
cp .env.example .env      # put your MONGO_URI and a JWT_SECRET in .env
npm install
npm run dev               # API on http://localhost:5000

# 2. Frontend (new terminal)
cd client
npm install
npm run dev               # App on http://localhost:5173
```

Open http://localhost:5173, register your centre, and start adding students.

## Deploy for free

**1. Database: MongoDB Atlas**
Create a free cluster, add a database user, and under *Network Access* allow `0.0.0.0/0` (Render's IP changes). Copy the connection string.

**2. API: Render**
Render dashboard → **New → Blueprint** → pick this repo. `render.yaml` sets everything up. Fill in:
- `MONGO_URI`: your Atlas string
- `CLIENT_URL`: your Netlify URL (you can add it after step 3)

Check `https://<your-api>.onrender.com/api/health` shows `{"ok":true}`.
Note: free Render services sleep when idle, so the first request after a while takes ~30–60 s.

**3. Frontend: Netlify**
Netlify → **Add new site → Import from GitHub** → pick this repo. `netlify.toml` already sets base `client`, build `npm run build`, publish `dist`. Add environment variable:
- `VITE_API_URL` = `https://<your-api>.onrender.com`

Deploy, then put the Netlify URL into Render's `CLIENT_URL` and redeploy the API.

## API

All routes except auth need `Authorization: Bearer <token>`.

| Method | Endpoint | What it does |
|---|---|---|
| POST | `/api/auth/register` | Create centre account |
| POST | `/api/auth/login` | Log in, returns JWT |
| GET/POST | `/api/students` | List (`?batch`, `?q`, `?active`) / add |
| PUT/DELETE | `/api/students/:id` | Edit / deactivate |
| GET | `/api/students/batches` | Batch names |
| GET | `/api/payments/status?month=YYYY-MM` | Fee, paid and due per student |
| GET/POST | `/api/payments` | Payment history (`?month`, `?student`) / record payment |
| GET/DELETE | `/api/payments/:id` | One payment with receipt details / delete |
| GET/POST | `/api/attendance?batch=&date=` | Get / save a day's attendance |
| GET | `/api/attendance/student/:id` | Attendance % for one student |
| GET | `/api/dashboard` | Summary numbers |
| GET | `/api/health` | Health check |

## Roadmap

- [x] Fee receipts as PDF
- [x] Export to Excel (CSV)
- [x] WhatsApp "fees received" message
- [ ] Student profile page with attendance history
- [ ] Monthly reports with charts
- [ ] Automatic WhatsApp reminders via WhatsApp Business API
- [ ] Multiple staff logins per centre

## Need this for your centre?

I build websites and apps for coaching centres, shops and small businesses.
Reach me on GitHub: **[@AnoopTaliyan](https://github.com/AnoopTaliyan)**
