# BookUp 📚

A full-stack book club management application. Create clubs, propose and vote on books, schedule reading sessions, and write reviews — all in one place.

🔗 **Live Demo:** [bookup-jade.vercel.app](https://bookup-jade.vercel.app)

## Demo Accounts

All accounts use password: `demo1234`

| Email | Role |
|-------|------|
| emma@demo.com | Admin — Sci-Fi Readers |
| olivia@demo.com | Admin — Classic Literature |
| sophia@demo.com | Admin — Mystery Club |
| benjamin@demo.com | Admin — Fantasy World |
| charlotte@demo.com | Admin — Non-Fiction Nerds |
| james@demo.com | Admin — Literature |
| william@demo.com | Member |
| michael@demo.com | Member |

## Features

- JWT authentication with bcrypt password hashing
-  Create and manage book clubs with invite codes
-  Search books via Google Books API
-  Propose and vote on next books to read
-  Track reading status (Proposed → Reading → Completed)
-  Schedule reading sessions with RSVP
-  Write and manage book reviews with star ratings
-  User profiles with Cloudinary avatar uploads
-  Role-based access control (Admin / Member)
-  Soft delete with audit trail

## Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Hono
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT + bcrypt
- **Logging:** Winston

### Frontend
- **Framework:** React 19
- **Language:** TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS + shadcn/ui
- **Data Fetching:** TanStack Query
- **Routing:** React Router v7
- **File Upload:** Cloudinary

### Infrastructure
- **Backend:** Railway
- **Frontend:** Vercel
- **Database:** PostgreSQL on Railway

## Local Development

### Prerequisites
- Node.js 20+
- PostgreSQL 14+

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Fill in your .env values
npx prisma migrate dev
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Fill in your .env values
npm run dev
```

### Seed Database

```bash
cd backend
npm run seed
```

## Environment Variables

### Backend (.env)

DATABASE_URL=postgresql://user@localhost:5432/bookup
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:5173
PORT=3000
GOOGLE_BOOKS_API_KEY=your-api-key
NODE_ENV=development

### Frontend (.env)

VITE_API_URL=http://localhost:3000
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
## Roadmap

### Phase 2
- Direct join for public clubs (no invite code required)
- Email notifications for new sessions and book status changes
- Leave club
- Password reset via email
- Dark mode
- Book carousel in the public feed
- Member management UI for admins