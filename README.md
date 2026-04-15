# 🎬 Rohit Vishwakarma — AI Portfolio

A full-stack portfolio platform for showcasing AI-crafted video ads, edits, voiceovers, and storytelling projects.

**Live:** [Frontend on Vercel](https://your-site.vercel.app) | **API:** [Backend on Render](https://your-backend.onrender.com)

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite + TailwindCSS |
| Backend | FastAPI (Python 3.11) + Motor (async MongoDB) |
| Database | MongoDB Atlas |
| Media | Cloudinary (video hosting & streaming) |
| Auth | JWT (HttpOnly cookies) + OTP via email |
| Deploy | Vercel (frontend) + Render (backend) |

---

## 📁 Project Structure

```
Portfolio vid/
├── backend/          # FastAPI application
│   ├── app/
│   │   ├── api/      # Route handlers
│   │   ├── core/     # Config, security, exceptions
│   │   ├── db/       # MongoDB connection
│   │   ├── models/   # Pydantic DB models
│   │   ├── schemas/  # Request/Response schemas
│   │   └── services/ # Business logic
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
└── frontend/         # React + Vite SPA
    ├── src/
    │   ├── components/
    │   ├── hooks/
    │   ├── pages/
    │   ├── services/
    │   ├── store/
    │   └── types/
    ├── package.json
    └── .env.example
```

---

## 🚀 Local Development

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
cp .env.example .env         # Fill in your values
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env         # Set VITE_API_URL=http://localhost:8000
npm run dev
```

---

## ☁️ Deployment

### Backend → Render

1. Connect this repo to [Render](https://render.com)
2. **Root Directory:** `backend`
3. **Build Command:** `pip install -r requirements.txt`
4. **Start Command:** `gunicorn -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:$PORT --workers 4`
5. Add all environment variables from `backend/.env.example` in the Render dashboard
6. Set `ENVIRONMENT=production` and `BACKEND_CORS_ORIGINS=https://your-site.vercel.app`

### Frontend → Vercel

1. Connect this repo to [Vercel](https://vercel.com)
2. **Root Directory:** `frontend`
3. **Build Command:** `npm run build`
4. **Output Directory:** `dist`
5. Add environment variables:
   - `VITE_API_URL` = your Render backend URL
   - `VITE_USE_MOCK` = `false`

---

## 🔐 Environment Variables

See [`backend/.env.example`](./backend/.env.example) and [`frontend/.env.example`](./frontend/.env.example).

> ⚠️ **Never commit `.env` files.** They are blocked by `.gitignore`.

### Required secrets to generate before production:
- `SECRET_KEY` → run `openssl rand -hex 32`
- `SMTP_PASSWORD` → use a [Gmail App Password](https://myaccount.google.com/apppasswords), **not** your real password
- `MONGODB_URI` → from MongoDB Atlas dashboard
- `CLOUDINARY_URL` → from Cloudinary dashboard

---

## ✨ Features

- 🎥 Video portfolio with Cloudinary streaming + YouTube embed support
- 🔒 Secure admin dashboard with OTP-based 2FA login
- 🔑 Forgot password flow (OTP → reset token → new password)
- ⭐ Featured videos appear first in the portfolio grid
- 📧 Contact form with email notifications
- 📊 Admin overview (storage, CPU, contacts)
- 🌙 Dark/light design with smooth animations

---

## 📄 License

MIT — © 2025 Rohit Vishwakarma
