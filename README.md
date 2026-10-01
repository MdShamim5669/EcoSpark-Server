# EcoSpark-Server

> **Robust, Production-Ready REST API for EcoSpark Hub** — An open, peer-moderated community sustainability platform built with Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, Google Gemini AI (RAG), Stripe, and Cloudinary.

---

## 🚀 Key Features

* **Authentication & Authorization:** Secure JWT-based authentication with bcrypt password hashing and Role-Based Access Control (`ADMIN`, `MODERATOR`, `MEMBER`).
* **Sustainability Initiatives Management:** Complete CRUD, drafting, community voting (Upvote/Downvote), nested comment threads, and categorization.
* **Transparent Moderation Workflow:** Lifecycle states (`DRAFT` → `UNDER_REVIEW` → `APPROVED` / `REJECTED`) with moderator feedback loops.
* **Dual Payment Gateways:** Support for paid sustainability blueprints via **Stripe** and **SSLCommerz Sandbox/Live**.
* **AI Knowledge Assistant (RAG):** Context-aware environmental AI chat powered by **Google Gemini** embeddings and vector search.
* **Resilient Media Storage:** Integrated with **Cloudinary** for image uploads, featuring automatic local disk fallbacks for maximum uptime.
* **Docker Ready:** Multi-stage production `Dockerfile` and `docker-compose.yml` with bundled PostgreSQL.

---

## 🛠️ Tech Stack

* **Runtime:** Node.js (v20+)
* **Language:** TypeScript
* **Framework:** Express.js
* **Database & ORM:** PostgreSQL, Prisma ORM
* **Validation:** Zod
* **AI / Vector Search:** `@google/genai` (Gemini Flash & Embeddings)
* **Storage:** Cloudinary SDK & Multer (with resilient local fallback)
* **Payments:** Stripe SDK, SSLCommerz
* **Containerization:** Docker & Docker Compose

---

## 🐳 Quick Start with Docker

The fastest way to spin up the entire backend stack along with a dedicated PostgreSQL database:

```bash
# 1. Clone the repository
git clone https://github.com/MdShamim5669/EcoSpark-Server.git
cd EcoSpark-Server

# 2. Configure environment variables
cp .env.example .env

# 3. Build and launch containers
docker compose up -d

# 4. Check container status & logs
docker compose logs -f
```

The server will be live at `http://localhost:5000`.

---

## 💻 Local Development Setup

### 1. Prerequisites
* **Node.js** (v20 or higher)
* **PostgreSQL** instance (Local or Neon Serverless PostgreSQL)

### 2. Installation
```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
```

### 3. Configure `.env`
Ensure your database URL and keys are populated in `.env`:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://user:password@localhost:5432/ecospark_hub?sslmode=require"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
CLIENT_URL="http://localhost:3000"
SERVER_URL="http://localhost:5000"

# Optional integrations
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
STRIPE_SECRET_KEY=""
GEMINI_API_KEY=""
```

### 4. Database Setup & Seeding
```bash
# Generate Prisma Client
npx prisma generate

# Push Prisma schema to database
npx prisma db push

# (Optional) Seed realistic sustainability initiatives and categories
npm run seed
```

### 5. Run Server
```bash
# Start development server with live reload
npm run dev

# Or build and run production bundle
npm run build
npm start
```

---

## 📡 Core API Endpoints

### 🔐 Authentication
* `POST /api/v1/auth/register` - Create new user account
* `POST /api/v1/auth/login` - Authenticate and receive JWT token
* `GET /api/v1/auth/me` - Get current authenticated user session

### 💡 Sustainability Ideas
* `GET /api/v1/ideas` - List ideas (with search, category, status, and sort filters)
* `GET /api/v1/ideas/top` - Get top-voted ideas
* `GET /api/v1/ideas/:id` - Get idea detail by ID
* `POST /api/v1/ideas` - Create proposal (starts in `DRAFT`)
* `PATCH /api/v1/ideas/:id` - Update draft or rejected idea
* `PATCH /api/v1/ideas/:id/submit` - Submit proposal for moderation review
* `DELETE /api/v1/ideas/:id` - Delete idea

### 🗳️ Voting & Comments
* `PUT /api/v1/ideas/:id/vote` - Cast Upvote / Downvote
* `DELETE /api/v1/ideas/:id/vote` - Remove vote
* `GET /api/v1/comments/idea/:id` - Fetch idea discussion comments
* `POST /api/v1/comments/idea/:id` - Add comment (supports threaded parent replies)

### 🖼️ File & Banner Uploads
* `POST /api/v1/upload/profile` - Upload user profile picture
* `POST /api/v1/upload/image?folder=ideas` - Upload proposal cover banner
* `POST /api/v1/upload/ideas` - Batch upload idea gallery photos (up to 5)

### 💳 Payments
* `POST /api/v1/payments/create-intent` - Initialize Stripe checkout for paid blueprints
* `POST /api/v1/payments/initiate-ssl` - Initialize SSLCommerz payment
* `POST /api/v1/payments/webhook` - Stripe webhook handler

### 🤖 AI Sustainability Assistant
* `POST /api/v1/ai/chat` - RAG-powered interactive clean-tech assistant
* `POST /api/v1/ai/similar-check` - Duplicate initiative detector

---

## 📜 License
This project is licensed under the [ISC License](LICENSE).