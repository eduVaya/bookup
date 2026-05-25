# BookUp API

REST API for BookUp, a full-stack book club management application. Built with Node.js, Hono, TypeScript, PostgreSQL and Prisma.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Hono
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + bcrypt
- **Logging**: Winston

## Features

- JWT authentication with bcrypt password hashing
- Role-based access control per club (Admin / Member)
- Soft delete with `deletedAt` and `deletedBy` fields
- Uniform API responses with success/error format
- Global error handling with Winston logging
- Google Books API integration for book search

## Prerequisites

- Node.js 18+
- PostgreSQL 14+

## Getting Started

### 1. Clone the repository

\`\`\`bash
git clone https://github.com/eduVaya/bookup.git
cd bookup/backend
\`\`\`

### 2. Install dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Set up environment variables

`.env` with your values:

\`\`\`
DATABASE_URL="postgresql://YOUR_USER@localhost:5432/bookup"
JWT_SECRET="your-secret-key"
FRONTEND_URL="http://localhost:5173"
PORT=3000
GOOGLE_BOOKS_API_KEY="your-google-books-api-key"
\`\`\`

### 4. Run database migrations

\`\`\`bash
npx prisma migrate dev
\`\`\`

### 5. Start the development server

\`\`\`bash
npm run dev
\`\`\`

API will be running at `http://localhost:3000`