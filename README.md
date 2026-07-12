# OfficialMail AI

A full-stack AI email generator. React + Vite + Tailwind frontend, Python
FastAPI backend, Google Gemini for AI generation, Firebase Firestore for
history & templates.

## Folder structure

```
OfficialMail-AI/
  backend/
    main.py                # FastAPI app + all routes
    models.py               # Pydantic request/response models
    services/
      gemini_service.py     # All Gemini prompt logic
      firebase_service.py   # Firestore reads/writes
      export_service.py     # PDF / DOCX generation
    requirements.txt
    .env.example
  frontend/
    src/
      pages/                # Home, GenerateEmail, InboxSummary, Templates, History, Settings
      components/           # Sidebar, Navbar, shared UI
      api.js                 # All backend API calls
    package.json
    .env.example
```

## 1. Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

Then edit `.env`:
- `GEMINI_API_KEY` — get one free at https://aistudio.google.com/app/apikey
- `FIREBASE_CREDENTIALS_PATH` — see step 3 below

Run the backend:

```bash
uvicorn main:app --reload --port 8000
```

Visit http://localhost:8000/docs to see and test every endpoint (FastAPI
gives you this automatically — very handy for your project demo).

## 2. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Visit http://localhost:5173

## 3. Firebase setup (for History + Templates)

1. Go to https://console.firebase.google.com and create a project.
2. Enable **Firestore Database** (start in test mode for development).
3. Go to Project Settings > Service Accounts > Generate new private key.
4. Save the downloaded JSON as `backend/firebase-service-account.json`
   (this filename matches `FIREBASE_CREDENTIALS_PATH` in `.env.example` —
   keep this file out of git, it's already in `.gitignore`).
5. Restart the backend. The `/api/templates` endpoint will auto-create the
   8 default templates the first time it's called.

If you skip Firebase setup, everything except **Templates** and **History**
will still work — the Generate Email and Inbox Summary pages don't need
Firestore.

## 4. Order to run for a demo

```bash
# Terminal 1
cd backend && uvicorn main:app --reload --port 8000

# Terminal 2
cd frontend && npm run dev
```

Then open http://localhost:5173

## What's implemented

- ✅ AI Email Generator (Subject, Greeting, Body, Closing, Signature)
- ✅ AI Editing Tools: More Formal, Friendlier, Expand, Shorten, Fix Grammar,
  Rewrite, Suggest Subject, Translate English ↔ Hindi
- ✅ Inbox Summarizer: summary, dates, people, deadlines, action items, priority
- ✅ Templates (8 defaults, seeded automatically into Firestore)
- ✅ History (auto-saved on generation, deletable)
- ✅ Export: Copy to Clipboard, Download PDF, Download DOCX
- ✅ Fully responsive, formal-only tone enforced in every AI prompt

## Deferred for v2 (mentioned so you can call it "future scope" in your report)

- Gmail API send integration (requires OAuth consent screen + Google verification)
- Per-user authentication (Firebase Auth) — currently all data uses a
  `guest` user_id; swap this for the logged-in user's UID once you add auth
