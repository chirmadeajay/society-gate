# 🏢 Society Gate — Production-Grade Visitor Management System

Full-stack AI-powered society gate management with real-time visitor approval via WhatsApp, face capture, and scalable microservices.

---

## 🚀 Stack

| Layer | Tech |
|-------|------|
| Backend | FastAPI + SQLAlchemy |
| Database | PostgreSQL |
| Cache | Redis |
| Frontend | React |
| Mobile | React Native (Expo) |
| Notifications | Twilio WhatsApp API |
| Face Capture | OpenCV |
| Auth | JWT (python-jose) |
| Deploy | Docker Compose |

---

## 📁 Project Structure

```
society-gate-app/
├── backend/
│   ├── app/
│   │   ├── core/security.py       # JWT auth
│   │   ├── services/
│   │   │   ├── whatsapp.py        # Twilio WhatsApp
│   │   │   ├── redis_service.py   # Redis status
│   │   │   └── face_recognition.py
│   │   ├── routers/
│   │   │   ├── auth.py            # Login / Register
│   │   │   └── visitors.py        # Visitor CRUD
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── db.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/                      # React Admin Dashboard
├── mobile-app/                    # React Native (Expo)
└── docker-compose.yml
```

---

## ⚡ Quick Start (Docker)

```bash
# 1. Clone / unzip the project
cd society-gate-app

# 2. Copy env file
cp backend/.env.example backend/.env
# Edit backend/.env with your Twilio credentials

# 3. Start everything
docker-compose up --build

# 4. Open
# Admin Dashboard → http://localhost:3000
# API Docs (Swagger) → http://localhost:8000/docs
```

---

## 🔐 First User (Guard/Admin)

Call the register API:

```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Guard 1","phone":"9999999999","flat":"GATE","role":"guard","password":"yourpassword"}'
```

---

## 📱 Mobile App Setup

```bash
cd mobile-app
npm install -g expo-cli
npm install
# Edit App.js → change API_URL to your machine's IP
expo start
```

Scan the QR code with **Expo Go** on your Android/iOS device.

---

## 🌐 Visitor Flow

1. Guard logs in → adds visitor (name, flat, purpose)
2. WhatsApp message sent to flat resident with Approve/Reject links
3. Resident taps link → status updates in DB + Redis
4. Dashboard/mobile auto-refreshes every 10 seconds

---

## ☁️ Free Deployment

| Service | Platform | Free Tier |
|---------|----------|-----------|
| Backend | Railway.app | ✅ |
| Frontend | Vercel | ✅ |
| Database | Supabase | ✅ |
| Redis | Railway / Upstash | ✅ |

---

## 🔑 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Register user |
| POST | /auth/login | Login → get token |
| GET | /visitors/ | List all visitors |
| POST | /visitors/ | Add visitor + notify |
| POST | /approve/{id} | Approve visitor |
| POST | /reject/{id} | Reject visitor |
| GET | /status/{id} | Get status from Redis |

Full Swagger docs at: `http://localhost:8000/docs`

---

## 🔥 Future Upgrades

- [ ] Face recognition auto-match with resident DB
- [ ] QR-based visitor passes
- [ ] License plate recognition
- [ ] AI suspicious behavior detection
- [ ] LangGraph AI agent integration
- [ ] Multi-society SaaS with payments

---

## 💰 SaaS Pricing Model

- ₹299/month per society (basic)
- ₹999/month premium (AI + analytics + exports)

---

## 🎯 Interview Story

> "Built a full-stack AI-powered society management system with real-time visitor approval via WhatsApp, face recognition, and scalable microservices using FastAPI, PostgreSQL, Redis, and React Native. Deployed using Docker with SaaS capability."
