<div align="center">

# 🛼 Indian Skating Academy

**India's #1 Inline Skating Academy — Nagpur**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![Express.js](https://img.shields.io/badge/Express.js-4-green?style=flat-square&logo=express)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen?style=flat-square&logo=mongodb)](https://mongodb.com)

*Crafted with passion for speed, artistry, and the rink.*

</div>

---

## 📖 Overview

The official website for **Indian Skating Academy (ISA)** — a premium inline skating academy based in Nagpur, India. The site showcases programs, locations, coaches, and allows prospective students to register their interest directly through WhatsApp or email.

---

## 🗂️ Project Structure

```
IndianSkatingAcademy/
├── frontend/          # Next.js 16 + TypeScript web app
│   ├── app/           # App Router pages (home, about, programs, join...)
│   ├── components/    # Reusable UI components
│   ├── hooks/         # Custom React hooks (GSAP, etc.)
│   ├── lib/           # Static data & utilities
│   └── styles/        # Global CSS design system
│
├── backend/           # Express.js + TypeScript REST API
│   ├── src/
│   │   ├── routes/    # API route handlers
│   │   ├── models/    # Mongoose schemas
│   │   └── services/  # MongoDB & Brevo email integrations
│   └── .env.example   # Environment variable template
│
└── package.json       # Root workspace scripts
```

---

## ⚡ Tech Stack

### Frontend
| Tech | Purpose |
|---|---|
| [Next.js 16](https://nextjs.org) | React framework (App Router) |
| TypeScript | Type-safe development |
| GSAP | Scroll animations & reveals |
| Framer Motion | UI transitions |
| OGL | WebGL circular gallery |
| Three.js | 3D scene rendering |
| Vanilla CSS | Custom design system with CSS variables |

### Backend
| Tech | Purpose |
|---|---|
| [Express.js](https://expressjs.com) | REST API server |
| TypeScript | Type-safe development |
| [Mongoose](https://mongoosejs.com) | MongoDB ODM |
| [Brevo SDK](https://developers.brevo.com) | Transactional emails |
| [Zod](https://zod.dev) | Request validation |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm 10+
- MongoDB Atlas account (cluster already configured)

### 1. Clone the repository
```bash
git clone https://github.com/your-org/IndianSkatingAcademy.git
cd IndianSkatingAcademy
```

### 2. Install all dependencies
```bash
npm install
```

> This automatically runs `npm install` in the root, `frontend/`, and `backend/` — all in one command via the `postinstall` hook.

### 3. Configure environment variables

**Backend** — copy `.env.example` to `.env` and fill in:
```bash
cd backend
cp .env.example .env
```

```env
PORT=4000
MONGODB_URI=mongodb+srv://...
BREVO_API_KEY=your_brevo_api_key
EMAIL_TO=indianskatingacademynagpur@gmail.com
EMAIL_FROM_NAME=Indian Skating Academy
EMAIL_FROM_ADDRESS=noreply@indianskatingacademy.in
WHATSAPP_NUMBER=91XXXXXXXXXX
FRONTEND_URL=http://localhost:3000
```

**Frontend** — create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WHATSAPP_NUMBER=91XXXXXXXXXX
```

### 4. Run in development

**Option A — Run together (from root):**
```bash
npm run dev
```

**Option B — Run separately:**
```bash
# Terminal 1 — Frontend
cd frontend && npm run dev

# Terminal 2 — Backend
cd backend && npm run dev
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:4000](http://localhost:4000)
- Health check: [http://localhost:4000/health](http://localhost:4000/health)

---

## 🌐 Pages

| Route | Description |
|---|---|
| `/` | Homepage — hero, programs overview, stats, gallery |
| `/about` | Team, coaches, core values |
| `/programs` | Detailed program listings |
| `/locations` | Academy locations & facilities |
| `/join` | Registration form with WhatsApp & Email submission |

---

## 📬 Join Form Flow

1. User fills out the form (name, age, phone, discipline)
2. Clicks **"Lace Up"** — two action buttons appear:
   - **🟢 WhatsApp** → Opens a prefilled `wa.me` message to ISA
   - **📧 Email** → Sends data to backend → saves to MongoDB → sends Brevo email to ISA

---

## 🔌 API Reference

### `POST /api/join`

Submit a join enquiry.

**Request Body:**
```json
{
  "name": "Riya Sharma",
  "age": 14,
  "phone": "9876543210",
  "discipline": "speed",
  "method": "email"
}
```

**Discipline options:** `speed` | `artistic` | `slalom` | `aggressive`  
**Method options:** `email` | `whatsapp`

**Response:**
```json
{ "success": true, "message": "Enquiry received! We will be in touch soon." }
```

---

## 🗃️ Database

**MongoDB Atlas** — Collection: `enquiries`

Each document stores:
```json
{
  "_id": "...",
  "name": "Riya Sharma",
  "age": 14,
  "phone": "9876543210",
  "discipline": "speed",
  "method": "email",
  "submittedAt": "2026-05-16T04:00:00.000Z"
}
```

---

## 📁 Key Files

| File | Description |
|---|---|
| `frontend/styles/globals.css` | Full design system — CSS variables, light/dark themes |
| `frontend/app/layout.tsx` | Root layout with theme + preloader setup |
| `backend/src/services/brevo.ts` | Styled HTML email template & send logic |
| `backend/src/models/Enquiry.ts` | Mongoose enquiry schema |
| `backend/.env.example` | Template for all required secrets |

---

## ❤️ Made By

| **Name**                | **Contact**                                        | **GitHub**                                      |
| :---------------------- | :------------------------------------------------- | :---------------------------------------------- |
| **Advait Kawale**       | advaitkawale@gmail.com <br> +91 93594 19281        | [Advait251206](https://github.com/Advait251206) |
| **Pravesh Shrivastava** | praveshpshrivastava@gmail.com <br> +91 90217 93584 | [Pravesh-21](https://github.com/Pravesh-21)     |
