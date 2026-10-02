# Ali Hassan - Portfolio Website

A world-class, production-ready portfolio website for a professional Graphic Designer. Built with React, Vite, TailwindCSS, Framer Motion, GSAP, and Supabase.

## Tech Stack

**Frontend:** React 18, Vite, TailwindCSS 3, Framer Motion, GSAP, Lenis, Swiper.js, React Query, React Router 6, React Hook Form

**Backend:** Express.js (Vercel Serverless Functions), Supabase (Database + Auth)

**AI:** Multi-provider chatbot (Groq `openai/gpt-oss-120b`, Google Gemini, OpenRouter) with automatic failover

**Hosting:** Vercel (frontend + serverless functions), Supabase (database)

## Features

- **Premium Design** — Apple/Stripe inspired minimalist aesthetic with glassmorphism, glow effects, and smooth animations
- **Full Admin Panel** — Dashboard, CRUD for all sections, statistics, SEO management
- **AI Chatbot** — Powered by Groq API, answers visitor questions about services, skills, and experience
- **Google Drive Integration** — Images served via Google Drive public links, stored in Supabase
- **Serverless Architecture** — 100% serverless deployment on Vercel
- **SEO Optimized** — Meta tags, Open Graph, schema markup, sitemap, robots.txt
- **Responsive** — Perfect on desktop, tablet, and mobile
- **Animations** — Page transitions, scroll reveals, text animations, parallax, 3D hover effects, magnetic buttons, custom cursor

## Project Structure

```
/
├── client/                 # React frontend
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── admin/          # Admin panel pages & components
│   │   ├── animations/     # Framer Motion variants
│   │   ├── components/     # Reusable components
│   │   │   ├── home/       # Home page sections
│   │   │   ├── layout/     # Navbar, Footer, FloatingButtons
│   │   │   ├── chatbot/    # AI Chatbot
│   │   │   └── ui/         # UI primitives
│   │   ├── context/        # React context
│   │   ├── hooks/          # Custom hooks
│   │   ├── layouts/        # Layout wrappers
│   │   ├── pages/          # Route pages
│   │   ├── services/       # API & Supabase clients
│   │   └── styles/         # Global CSS
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/                 # Express backend
│   ├── api/                # Vercel serverless entry
│   ├── config/             # Environment config
│   ├── middleware/          # Auth middleware
│   ├── routes/             # API routes
│   └── supabase/           # DB client & migration
├── vercel.json             # Vercel deployment config
└── .env                    # Environment variables
```

## Getting Started

### 1. Clone & Install

```bash
cd portfolio
cd client && npm install
cd ../server && npm install
```

### 2. Database Setup

Run the migration SQL in Supabase SQL Editor:
```
server/supabase/migration.sql
```

### 3. Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
# Supabase
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SUPABASE_SERVICE_ROLE=your_service_role_key

# AI provider key (optional fallback — primary source is the ai_providers table,
# edited via Admin → AI Providers)
GROQ_API_KEY=your_groq_api_key

# JWT Secret
JWT_SECRET=your_jwt_secret
```

### 4. Run Locally

```bash
# Terminal 1 - Frontend
cd client && npm run dev

# Terminal 2 - Backend
cd server && npm run dev
```

Frontend: http://localhost:5173
Backend API: http://localhost:3000/api
Admin Panel: http://localhost:5173/admin

### 5. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
vercel env add
```

## Admin Panel

Access `/admin` and sign in with your Supabase Auth credentials.

**Available sections:**
- Dashboard — Stats overview
- Hero — Edit hero section content
- About — Bio, mission, vision
- Services — CRUD for services
- Projects — CRUD for portfolio projects
- Categories — Manage project categories
- Skills — Manage skills with percentage
- Team — Manage team members
- Messages — View contact form submissions
- Newsletter — View subscribers
- Social Links — Manage social media URLs
- Chatbot — Configure AI assistant
- SEO — Meta tags & Open Graph settings
- Settings — Site-wide configuration

## API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Admin login |
| GET | /api/auth/verify | Verify JWT token |
| POST | /api/contact | Submit contact form |
| POST | /api/newsletter | Subscribe to newsletter |
| POST | /api/chat | Chat with AI assistant |
| GET | /api/health | Health check |

All admin CRUD routes are under `/api/admin/*` and require JWT authentication.

## Image System

- Store images on Google Drive
- Get shareable link
- Paste the URL in admin panel fields
- Images are lazy-loaded with skeleton placeholders

To convert a Google Drive share link to direct URL format:
`https://drive.google.com/uc?export=view&id=FILE_ID`

## Performance

- Code splitting via React.lazy
- Lazy loading images
- Memoized components
- Optimized bundle with manual chunks
- Lighthouse score target: 95+

## License

MIT
