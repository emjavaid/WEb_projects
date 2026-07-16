# StudyVault 📚
### University Notes Sharing & Rating Platform

**Project Topic:** StudyVault  
**Developer:** [Your Name] | Roll No: [Your Roll Number]  
**University:** FAST-NUCES  
**Course:** Web Engineering / Software Engineering

---

## Overview

StudyVault is a full-stack web application that allows university students to:
- Upload and share study notes by subject
- Search and filter notes by subject, keyword, or popularity
- Rate notes (1–5 stars) and leave comments
- Track downloads and manage personal uploads
- Authenticate securely with JWT tokens

---

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React.js, React Router, Axios     |
| Backend   | Node.js, Express.js               |
| Database  | MongoDB (Mongoose ODM)            |
| Auth      | JWT (JSON Web Tokens) + Bcrypt    |

---

## Project Structure

```
studyvault/
├── backend/
│   ├── models/
│   │   ├── User.js         # User schema (name, rollNo, email, password)
│   │   └── Note.js         # Note schema (title, subject, ratings, comments)
│   ├── routes/
│   │   ├── auth.js         # Register, Login, Get current user
│   │   ├── notes.js        # CRUD + rate + comment + download
│   │   └── users.js        # Profile, saved notes
│   ├── middleware/
│   │   └── auth.js         # JWT protect middleware
│   ├── server.js           # Express app entry point
│   ├── .env.example        # Environment variable template
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.js
    │   │   └── NoteCard.js
    │   ├── context/
    │   │   └── AuthContext.js  # Global auth state
    │   ├── pages/
    │   │   ├── Home.js         # Browse & filter notes
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   ├── NoteDetail.js   # View, rate, comment
    │   │   ├── UploadNote.js   # Upload new notes
    │   │   └── Profile.js      # User stats & uploads
    │   ├── App.js
    │   ├── App.css
    │   └── index.js
    └── package.json
```

---

## API Endpoints

### Auth
| Method | Endpoint            | Description          | Auth? |
|--------|---------------------|----------------------|-------|
| POST   | /api/auth/register  | Register new user    | No    |
| POST   | /api/auth/login     | Login                | No    |
| GET    | /api/auth/me        | Get current user     | Yes   |

### Notes
| Method | Endpoint                  | Description            | Auth? |
|--------|---------------------------|------------------------|-------|
| GET    | /api/notes                | Get all notes          | No    |
| GET    | /api/notes/:id            | Get single note        | No    |
| POST   | /api/notes                | Create note            | Yes   |
| PUT    | /api/notes/:id            | Update note            | Yes   |
| DELETE | /api/notes/:id            | Delete note            | Yes   |
| POST   | /api/notes/:id/rate       | Rate a note            | Yes   |
| POST   | /api/notes/:id/comment    | Comment on a note      | Yes   |
| POST   | /api/notes/:id/download   | Increment downloads    | No    |

---

## Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)

### 1. Clone & Setup Backend
```bash
cd backend
cp .env.example .env       # Edit with your MongoDB URI
npm install
npm run dev                # Runs on http://localhost:5000
```

### 2. Setup Frontend
```bash
cd frontend
npm install
npm start                  # Runs on http://localhost:3000
```

### 3. Environment Variables (backend/.env)
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/studyvault
JWT_SECRET=your_secret_key_here
CLIENT_URL=http://localhost:3000
```

---

## Deployment

- **Frontend:** Deploy to [Vercel](https://vercel.com) — connect your GitHub repo
- **Backend:** Deploy to [Render](https://render.com) or [Railway](https://railway.app)
- **Database:** Use [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier)

After deployment, update `CLIENT_URL` in backend `.env` and the `proxy` in frontend `package.json`.

---

## Deliverables

- [x] Word Document (Project Report)
- [x] Code Files (React + Node.js)
- [ ] Deployed Project Link (add after deployment)

---

## Features

- JWT Authentication (Register / Login / Protected routes)
- Upload notes with subject, tags, description
- Browse & search notes by subject/keyword
- 5-star rating system (per user, averaged)
- Comment system with timestamps
- Download counter
- User profile with stats
- Fully responsive UI
