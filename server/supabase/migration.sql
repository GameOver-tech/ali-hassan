-- Portfolio Database Schema
-- Run this in Supabase SQL Editor
--
-- AFTER running this migration, create an admin user:
-- 1. Go to Supabase Dashboard → Authentication → Users → Add User
-- 2. Email: admin@alihassan.dev
-- 3. Password: Admin@786
-- 4. Or run: node server/scripts/create-admin.js

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Process Steps (My Development Process section - Services page)
CREATE TABLE IF NOT EXISTS public.process_steps (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    step TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    "order" INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.process_steps ENABLE ROW LEVEL SECURITY;
-- Policies are created below with standardized names

-- Insert default process steps
INSERT INTO public.process_steps (step, title, description, "order") VALUES
  ('01', 'Discovery', 'Understanding your goals, requirements, and technical landscape.', 1),
  ('02', 'Architecture', 'Designing the system architecture, data flow, and tech stack.', 2),
  ('03', 'Build', 'Iterative development with continuous testing and refinement.', 3),
  ('04', 'Deploy', 'Production deployment, monitoring, and ongoing optimization.', 4)
ON CONFLICT DO NOTHING;

-- Users (managed by Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hero Section
CREATE TABLE IF NOT EXISTS public.hero (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT DEFAULT 'Ali Hassan',
    title TEXT DEFAULT 'Graphic Designer',
    subtitle TEXT,
    badge_text TEXT DEFAULT 'Available for Freelance Projects',
    typing_titles JSONB DEFAULT '["Graphic Designer", "Brand Identity Designer", "UI Designer", "Motion Designer"]',
    intro_paragraph TEXT DEFAULT 'Crafting premium visual identities and digital experiences that make brands unforgettable.',
    photo_url TEXT,
    resume_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add new columns if table already exists (safe re-run)
DO $$ BEGIN
    ALTER TABLE public.hero ADD COLUMN IF NOT EXISTS badge_text TEXT DEFAULT 'Available for Freelance Projects';
    ALTER TABLE public.hero ADD COLUMN IF NOT EXISTS typing_titles JSONB DEFAULT '["Graphic Designer", "Brand Identity Designer", "UI Designer", "Motion Designer"]';
    ALTER TABLE public.hero ADD COLUMN IF NOT EXISTS intro_paragraph TEXT DEFAULT 'Crafting premium visual identities and digital experiences that make brands unforgettable.';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Stats / Metrics Counters
CREATE TABLE IF NOT EXISTS public.stats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    label TEXT NOT NULL,
    value INTEGER NOT NULL DEFAULT 0,
    suffix TEXT DEFAULT '',
    "order" INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- About Section
CREATE TABLE IF NOT EXISTS public.about (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    bio TEXT,
    mission TEXT,
    vision TEXT,
    photo_url TEXT,
    cv_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services
CREATE TABLE IF NOT EXISTS public.services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    status TEXT DEFAULT 'published' CHECK (status IN ('published', 'draft')),
    featured BOOLEAN DEFAULT false,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    category TEXT,
    client TEXT,
    duration TEXT,
    software TEXT,
    thumbnail_url TEXT,
    project_url TEXT,
    case_study_url TEXT,
    github_url TEXT,
    problem TEXT,
    solution TEXT,
    status TEXT DEFAULT 'published' CHECK (status IN ('published', 'draft')),
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add project_url column if table already exists (safe re-run)
DO $$ BEGIN
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS project_url TEXT;
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS case_study_url TEXT;
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS github_url TEXT;
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS pdf_url TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Project Images Gallery
CREATE TABLE IF NOT EXISTS public.project_images (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    alt TEXT,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Skills
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    level INTEGER CHECK (level >= 1 AND level <= 100),
    category TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Experience
CREATE TABLE IF NOT EXISTS public.experience (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    company TEXT,
    location TEXT,
    start_date DATE,
    end_date DATE,
    description TEXT,
    current BOOLEAN DEFAULT false,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Education
CREATE TABLE IF NOT EXISTS public.education (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    degree TEXT NOT NULL,
    institution TEXT,
    year TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team Members
CREATE TABLE IF NOT EXISTS public.team (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT,
    description TEXT,
    photo_url TEXT,
    social_links JSONB DEFAULT '{}',
    active BOOLEAN DEFAULT true,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Testimonials
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT,
    company TEXT,
    content TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    photo_url TEXT,
    status TEXT DEFAULT 'published' CHECK (status IN ('published', 'draft')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog Posts
CREATE TABLE IF NOT EXISTS public.blogs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT,
    excerpt TEXT,
    cover_image TEXT,
    category TEXT,
    tags TEXT[],
    status TEXT DEFAULT 'draft' CHECK (status IN ('published', 'draft')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact Messages
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Newsletter Subscribers
CREATE TABLE IF NOT EXISTS public.newsletter (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Social Links
CREATE TABLE IF NOT EXISTS public.social_links (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    platform TEXT NOT NULL UNIQUE,
    url TEXT NOT NULL,
    icon TEXT,
    active BOOLEAN DEFAULT true,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- FAQs
CREATE TABLE IF NOT EXISTS public.faqs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT,
    "order" INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site Settings
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    site_name TEXT DEFAULT 'Ali Hassan',
    site_description TEXT,
    contact_email TEXT,
    phone TEXT,
    address TEXT,
    whatsapp TEXT,
    copyright_text TEXT,
    section_titles JSONB DEFAULT '{"featured_projects":"Featured Projects","services":"Services & Expertise","testimonials":"What Clients Say","cta_title":"Let''s Create Something Amazing","cta_subtitle":"Ready to elevate your brand?"}',
    logo_text TEXT DEFAULT 'AH',
    logo_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add columns if they don't exist (for re-runs after table already created)
DO $$ BEGIN
    ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS copyright_text TEXT;
    ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS section_titles JSONB DEFAULT '{"featured_projects":"Featured Projects","services":"Services & Expertise","testimonials":"What Clients Say","cta_title":"Let''s Create Something Amazing","cta_subtitle":"Ready to elevate your brand?"}';
    ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS logo_text TEXT DEFAULT 'AH';
    ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS logo_image_url TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- SEO Settings
CREATE TABLE IF NOT EXISTS public.seo (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    meta_title TEXT,
    meta_description TEXT,
    og_title TEXT,
    og_description TEXT,
    og_image TEXT,
    keywords TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chatbot Configuration
CREATE TABLE IF NOT EXISTS public.chatbot_config (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    greeting TEXT DEFAULT '👋 Hi! How can I help you today?',
    system_prompt TEXT,
    model TEXT DEFAULT 'openai/gpt-oss-120b',
    temperature REAL DEFAULT 0.7,
    max_tokens INTEGER DEFAULT 500,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics (page views)
CREATE TABLE IF NOT EXISTS public.analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    page TEXT,
    referrer TEXT,
    user_agent TEXT,
    ip_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Providers (dynamic multi-provider support)
CREATE TABLE IF NOT EXISTS public.ai_providers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    provider_name TEXT NOT NULL UNIQUE,
    api_key TEXT NOT NULL,
    model TEXT NOT NULL DEFAULT 'openai/gpt-oss-120b',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    priority INTEGER DEFAULT 0,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Certifications
CREATE TABLE IF NOT EXISTS public.certifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    issuer TEXT,
    credential_url TEXT,
    issue_date DATE,
    expiry_date DATE,
    description TEXT,
    image_url TEXT,
    "order" INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns to settings for full dynamic control
DO $$ BEGIN
    ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS favicon TEXT;
    ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS theme_color TEXT DEFAULT '#00F0FF';
    ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#7C3AED';
    ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#00F0FF';
    ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS loader_enabled BOOLEAN DEFAULT true;
    ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS animations_enabled BOOLEAN DEFAULT true;
    ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS google_map TEXT;
    ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS working_hours TEXT;
    ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS github TEXT;
    ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS facebook TEXT;
    ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS instagram TEXT;
    ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS twitter TEXT;
    ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS linkedin TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Add pdf_url to certifications
DO $$ BEGIN
    ALTER TABLE public.certifications ADD COLUMN IF NOT EXISTS pdf_url TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Add missing columns to education
DO $$ BEGIN
    ALTER TABLE public.education ADD COLUMN IF NOT EXISTS description TEXT;
    ALTER TABLE public.education ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
    ALTER TABLE public.education ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Add icons to skills  
DO $$ BEGIN
    ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS icon TEXT;
    ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Add price/features to services
DO $$ BEGIN
    ALTER TABLE public.services ADD COLUMN IF NOT EXISTS price TEXT;
    ALTER TABLE public.services ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]';
    ALTER TABLE public.services ADD COLUMN IF NOT EXISTS image TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Add hidden tables RLS
ALTER TABLE public.ai_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;

-- Enable Row Level Security (safe to re-run, does nothing if already enabled)
ALTER TABLE public.hero ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stats ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first so this migration is idempotent (safe to re-run)
DROP POLICY IF EXISTS "Public read access" ON public.hero;
DROP POLICY IF EXISTS "Public read access" ON public.about;
DROP POLICY IF EXISTS "Public read access" ON public.services;
DROP POLICY IF EXISTS "Public read access" ON public.projects;
DROP POLICY IF EXISTS "Public read access" ON public.project_images;
DROP POLICY IF EXISTS "Public read access" ON public.skills;
DROP POLICY IF EXISTS "Public read access" ON public.team;
DROP POLICY IF EXISTS "Public read access" ON public.testimonials;
DROP POLICY IF EXISTS "Public read access" ON public.social_links;
DROP POLICY IF EXISTS "Public read access" ON public.categories;
DROP POLICY IF EXISTS "Public read access" ON public.settings;
DROP POLICY IF EXISTS "Public read access" ON public.seo;
DROP POLICY IF EXISTS "Public read access" ON public.chatbot_config;
DROP POLICY IF EXISTS "Admin full access" ON public.hero;
DROP POLICY IF EXISTS "Admin full access" ON public.about;
DROP POLICY IF EXISTS "Admin full access" ON public.services;
DROP POLICY IF EXISTS "Admin full access" ON public.projects;
DROP POLICY IF EXISTS "Admin full access" ON public.project_images;
DROP POLICY IF EXISTS "Admin full access" ON public.skills;
DROP POLICY IF EXISTS "Admin full access" ON public.team;
DROP POLICY IF EXISTS "Admin full access" ON public.testimonials;
DROP POLICY IF EXISTS "Allow public insert" ON public.messages;
DROP POLICY IF EXISTS "Allow public insert" ON public.newsletter;
DROP POLICY IF EXISTS "Admin full access" ON public.messages;
DROP POLICY IF EXISTS "Admin full access" ON public.newsletter;
DROP POLICY IF EXISTS "Admin full access" ON public.social_links;
DROP POLICY IF EXISTS "Admin full access" ON public.settings;
DROP POLICY IF EXISTS "Admin full access" ON public.seo;
DROP POLICY IF EXISTS "Admin full access" ON public.chatbot_config;
DROP POLICY IF EXISTS "Admin full access" ON public.categories;
DROP POLICY IF EXISTS "Public read access" ON public.stats;
DROP POLICY IF EXISTS "Admin full access" ON public.stats;
DROP POLICY IF EXISTS "Public read access" ON public.experience;
DROP POLICY IF EXISTS "Admin full access" ON public.experience;
DROP POLICY IF EXISTS "Public read access" ON public.education;
DROP POLICY IF EXISTS "Admin full access" ON public.education;
DROP POLICY IF EXISTS "Public read access" ON public.faqs;
DROP POLICY IF EXISTS "Admin full access" ON public.faqs;
DROP POLICY IF EXISTS "Public read access" ON public.blogs;
DROP POLICY IF EXISTS "Admin full access" ON public.blogs;
DROP POLICY IF EXISTS "Admin full access" ON public.ai_providers;
DROP POLICY IF EXISTS "Public read access" ON public.certifications;
DROP POLICY IF EXISTS "Admin full access" ON public.certifications;
DROP POLICY IF EXISTS "Public read access" ON public.process_steps;
DROP POLICY IF EXISTS "Admin full access" ON public.process_steps;

-- Public read access for published data
CREATE POLICY "Public read access" ON public.hero FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.about FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.services FOR SELECT USING (status = 'published');
CREATE POLICY "Public read access" ON public.projects FOR SELECT USING (status = 'published');
CREATE POLICY "Public read access" ON public.project_images FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.skills FOR SELECT USING (active = true);
CREATE POLICY "Public read access" ON public.team FOR SELECT USING (active = true);
CREATE POLICY "Public read access" ON public.testimonials FOR SELECT USING (status = 'published');
CREATE POLICY "Public read access" ON public.social_links FOR SELECT USING (active = true);
CREATE POLICY "Public read access" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.seo FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.chatbot_config FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.process_steps FOR SELECT USING (active = true);

-- Public insert for contact form and newsletter (unauthenticated users)
CREATE POLICY "Allow public insert" ON public.messages FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public insert" ON public.newsletter FOR INSERT TO anon WITH CHECK (true);

-- Admin full access (authenticated users only)
CREATE POLICY "Admin full access" ON public.hero FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access" ON public.about FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access" ON public.services FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access" ON public.projects FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access" ON public.project_images FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access" ON public.skills FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access" ON public.team FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access" ON public.testimonials FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access" ON public.messages FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access" ON public.newsletter FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access" ON public.social_links FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access" ON public.settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access" ON public.seo FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access" ON public.chatbot_config FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access" ON public.categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Public read access" ON public.stats FOR SELECT USING (active = true);
CREATE POLICY "Admin full access" ON public.stats FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Public read access" ON public.experience FOR SELECT USING (true);
CREATE POLICY "Admin full access" ON public.experience FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Public read access" ON public.education FOR SELECT USING (true);
CREATE POLICY "Admin full access" ON public.education FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Public read access" ON public.faqs FOR SELECT USING (active = true);
CREATE POLICY "Admin full access" ON public.faqs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Public read access" ON public.blogs FOR SELECT USING (status = 'published');
CREATE POLICY "Admin full access" ON public.blogs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access" ON public.ai_providers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Public read access" ON public.certifications FOR SELECT USING (active = true);
CREATE POLICY "Admin full access" ON public.certifications FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access" ON public.process_steps FOR ALL USING (auth.role() = 'authenticated');

-- Insert default social links
INSERT INTO public.social_links (platform, url) VALUES
    ('github', 'https://github.com/alihassan'),
    ('linkedin', 'https://linkedin.com/in/alihassan'),
    ('whatsapp', 'https://wa.me/923102850365')
ON CONFLICT (platform) DO NOTHING;

-- Insert sample certifications
INSERT INTO public.certifications (title, issuer, credential_url, issue_date, description, pdf_url, "order", active) VALUES
  ('Adobe Certified Professional – Visual Design', 'Adobe', 'https://www.credly.com/org/adobe', '2025-01-15', 'Professional certification in visual design using Adobe Photoshop, Illustrator, and InDesign.', 'https://www.adobe.com/content/dam/acom/en/legal/terms/enterprise/pdfs/Adobe-Enterprise-Terms.pdf', 1, true),
  ('Google UX Design Professional', 'Google (Coursera)', 'https://www.coursera.org/professional-certificates/google-ux-design', '2024-08-20', 'Comprehensive certification in UX research, wireframing, prototyping, and design thinking.', NULL, 2, true),
  ('Meta Front-End Developer', 'Meta (Coursera)', 'https://www.coursera.org/professional-certificates/meta-front-end-developer', '2024-03-10', 'Professional certificate in modern front-end development with React and responsive design.', NULL, 3, true),
  ('Graphic Design Specialization', 'California Institute of the Arts', 'https://www.coursera.org/specializations/graphic-design', '2025-05-01', 'Advanced training in typography, branding, image-making, and visual communication.', NULL, 4, true),
  ('HubSpot Content Marketing', 'HubSpot Academy', 'https://academy.hubspot.com/courses/content-marketing', '2024-11-20', 'Certification in content strategy, social media marketing, and brand storytelling.', NULL, 5, true),
  ('UI/UX Design Bootcamp', 'Designlab', 'https://designlab.com/', '2024-06-15', 'Hands-on certification in user interface design, prototyping with Figma, and user testing.', NULL, 6, true)
ON CONFLICT DO NOTHING;

-- ============================================================
-- SINGLE-ROW SEED DATA (settings, hero, about, seo, chatbot_config)
-- These use fixed IDs + ON CONFLICT (id) so re-running the
-- migration NEVER creates duplicate rows. Only inserts if missing.
-- ============================================================

-- First, deduplicate any existing rows (keep only the latest)
-- This is safe to re-run; if only 1 row exists it does nothing.
DELETE FROM public.settings WHERE id NOT IN (SELECT id FROM public.settings ORDER BY created_at DESC LIMIT 1);
DELETE FROM public.hero WHERE id NOT IN (SELECT id FROM public.hero ORDER BY created_at DESC LIMIT 1);
DELETE FROM public.about WHERE id NOT IN (SELECT id FROM public.about ORDER BY created_at DESC LIMIT 1);
DELETE FROM public.seo WHERE id NOT IN (SELECT id FROM public.seo ORDER BY created_at DESC LIMIT 1);
DELETE FROM public.chatbot_config WHERE id NOT IN (SELECT id FROM public.chatbot_config ORDER BY created_at DESC LIMIT 1);

-- Insert default settings (only if table is empty — ON CONFLICT (id) prevents duplicates)
INSERT INTO public.settings (id, site_name, site_description, contact_email, phone, address, whatsapp, copyright_text)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Ali Hassan',
    'Full-Stack AI Engineer & Web Developer — building intelligent systems, web applications, and digital experiences that drive business growth.',
    'alihassan.webstudio@gmail.com',
    '+923102850365',
    'Gojra, Punjab, Pakistan',
    '923102850365',
    '© 2026 Ali Hassan. All rights reserved.'
) ON CONFLICT (id) DO NOTHING;

-- Insert default chatbot config
INSERT INTO public.chatbot_config (id, greeting, system_prompt, enabled)
VALUES (
    '00000000-0000-0000-0000-000000000002',
    '👋 Hi! I''m Ali''s AI assistant. Ask me about his skills, projects, experience, or how to get in touch!',
    'You are a professional portfolio assistant for Ali Hassan, a Full-Stack AI Engineer and Web Developer.',
    true
) ON CONFLICT (id) DO NOTHING;

-- Insert default SEO
INSERT INTO public.seo (id, meta_title, meta_description, keywords)
VALUES (
    '00000000-0000-0000-0000-000000000003',
    'Ali Hassan | Full-Stack AI Engineer & Web Developer',
    'Professional Full-Stack AI Engineer specializing in AI systems, web development, and intelligent applications.',
    'AI engineer, web developer, full-stack, React, Node.js, Pakistan'
) ON CONFLICT (id) DO NOTHING;

-- Insert default hero
INSERT INTO public.hero (id, name, title, subtitle, photo_url, resume_url)
VALUES (
    '00000000-0000-0000-0000-000000000004',
    'Ali Hassan',
    'Full-Stack AI Engineer',
    'Crafting premium digital experiences and AI-powered solutions',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80', NULL
) ON CONFLICT (id) DO NOTHING;

-- Insert default about
INSERT INTO public.about (id, bio, mission, vision, photo_url, cv_url)
VALUES (
    '00000000-0000-0000-0000-000000000005',
    'I''m a passionate Full-Stack AI Engineer with expertise in building intelligent systems, web applications, and AI-powered solutions. My approach combines cutting-edge AI technology with robust software engineering to deliver products that solve real-world problems.',
    'To democratize AI technology by building accessible, intelligent solutions that empower businesses and individuals to achieve more.',
    'To be at the forefront of AI innovation, creating systems that seamlessly integrate intelligence into everyday applications.',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80', NULL
) ON CONFLICT (id) DO NOTHING;

-- Insert default stats
INSERT INTO public.stats (label, value, suffix, "order", active) VALUES
  ('Years Experience', 3, '+', 1, true),
  ('Projects Completed', 50, '+', 2, true),
  ('Technologies', 25, '+', 3, true),
  ('Happy Clients', 30, '+', 4, true)
ON CONFLICT DO NOTHING;

-- Insert sample categories
INSERT INTO public.categories (name) VALUES
  ('Web App'), ('AI/ML'), ('API'), ('Dashboard'), ('Mobile'), ('Full-Stack')
ON CONFLICT (name) DO NOTHING;

-- Insert sample services
INSERT INTO public.services (title, description, icon, status, "order") VALUES
  ('Full-Stack Web Development', 'End-to-end web applications built with React, Node.js, and modern frameworks. Responsive, fast, and scalable.', 'FiMonitor', 'published', 1),
  ('AI & Machine Learning', 'Intelligent systems including LLM integration, chatbots, RAG pipelines, and predictive models powered by cutting-edge AI.', 'FiCpu', 'published', 2),
  ('API Development', 'RESTful and GraphQL API design, development, and deployment. Secure, documented, and performance-optimized.', 'FiCode', 'published', 3),
  ('Database Architecture', 'Scalable database design with Supabase, PostgreSQL, and optimized query patterns for high-performance applications.', 'FiDatabase', 'published', 4),
  ('Cloud & DevOps', 'Deployment automation, CI/CD pipelines, containerization, and cloud infrastructure on Vercel, AWS, and DigitalOcean.', 'FiCloud', 'published', 5),
  ('UI/UX Design', 'Beautiful, intuitive interfaces designed with user-centered principles. From wireframes to pixel-perfect implementations.', 'FiPenTool', 'published', 6)
ON CONFLICT DO NOTHING;

-- Insert sample skills
INSERT INTO public.skills (name, level, category, icon, active) VALUES
  ('React.js', 95, 'Frontend', 'FiCode', true),
  ('Node.js', 90, 'Backend', 'FiServer', true),
  ('TypeScript', 88, 'Languages', 'FiFileText', true),
  ('Python', 85, 'Languages', 'FiTerminal', true),
  ('PostgreSQL', 82, 'Database', 'FiDatabase', true),
  ('Supabase', 88, 'Database', 'FiCloud', true),
  ('Express.js', 90, 'Backend', 'FiCode', true),
  ('Framer Motion', 80, 'Frontend', 'FiMove', true),
  ('Tailwind CSS', 92, 'Frontend', 'FiLayout', true),
  ('Git', 85, 'DevOps', 'FiGitBranch', true),
  ('Docker', 70, 'DevOps', 'FiBox', true),
  ('AI/LLM Integration', 90, 'AI', 'FiCpu', true),
  ('REST API Design', 88, 'Backend', 'FiLink', true),
  ('Vercel Deployment', 85, 'DevOps', 'FiCloud', true)
ON CONFLICT DO NOTHING;

-- Insert sample projects
INSERT INTO public.projects (title, slug, description, category, client, duration, software, thumbnail_url, problem, solution, status, featured) VALUES
  (
    'AI-Powered Portfolio CMS',
    'ai-portfolio-cms',
    'A fully dynamic portfolio management system with AI chatbot, admin panel, and multi-provider AI support. Built with React, Node.js, Express, and Supabase.',
    'Full-Stack',
    'Personal Project',
    '2 weeks',
    'React, Node.js, Express, Supabase, Groq, Gemini, OpenRouter',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    'Managing portfolio content required editing source code. No dynamic content management or AI-powered visitor engagement existed.',
    'Built a complete CMS with admin panel, dynamic database-driven content, multi-provider AI chatbot, and seamless Vercel deployment.',
    'published', true
  ),
  (
    'Intelligent Chatbot System',
    'intelligent-chatbot-system',
    'Multi-provider AI chatbot supporting Groq, Google Gemini, and OpenRouter with automatic failover. Reads portfolio data from database for contextual responses.',
    'AI/ML',
    'Personal Project',
    '1 week',
    'Node.js, Express, Groq SDK, Google AI SDK, OpenRouter, Supabase',
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    'Chatbots were hardcoded with single provider API keys and static information that required code changes to update.',
    'Created an agentic chatbot with dynamic provider switching, database-powered knowledge, and automatic failover between AI providers.',
    'published', true
  ),
  (
    'E-Commerce Platform API',
    'ecommerce-api',
    'Comprehensive REST API for an e-commerce platform with authentication, product management, order processing, and payment integration.',
    'API',
    'ShopSwift',
    '3 weeks',
    'Node.js, Express, PostgreSQL, JWT, Stripe, Redis',
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    'The client needed a scalable backend for their growing e-commerce platform with complex product catalog and real-time inventory management.',
    'Designed and implemented a modular API with rate limiting, caching, webhook support, and comprehensive error handling serving 10K+ daily requests.',
    'published', true
  ),
  (
    'Real-Time Dashboard',
    'real-time-dashboard',
    'Interactive real-time analytics dashboard with live data updates, charts, and collaborative features for business intelligence.',
    'Dashboard',
    'DataViz Corp',
    '4 weeks',
    'React, D3.js, WebSocket, Node.js, PostgreSQL, Redis',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    'Business teams needed real-time visibility into KPIs but existing tools had 15+ minute data latency.',
    'Built a real-time dashboard with sub-second data refresh, customizable widgets, export capabilities, and role-based access controls.',
    'published', false
  ),
  (
    'RAG-Based Document System',
    'rag-document-system',
    'Retrieval-Augmented Generation system for intelligent document querying. Users can upload documents and ask natural language questions.',
    'AI/ML',
    'LegalTech Solutions',
    '2 weeks',
    'Python, LangChain, Pinecone, OpenAI, FastAPI, React',
    'https://images.unsplash.com/photo-1455390582262-044cdead277a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    'A law firm needed to quickly search and extract information from thousands of legal documents without manual review.',
    'Implemented RAG pipeline with vector embeddings, semantic search, and LLM-powered answer generation achieving 95% accuracy on legal queries.',
    'published', true
  ),
  (
    'Task Management App',
    'task-management-app',
    'Full-stack task management application with real-time collaboration, drag-drop boards, and team workflow automation.',
    'Full-Stack',
    'StartupHub',
    '3 weeks',
    'React, Node.js, Socket.io, PostgreSQL, Redis, Docker',
    'https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    'Remote teams struggled with fragmented communication and task tracking across multiple tools.',
    'Developed an integrated platform with Kanban boards, real-time updates, automated notifications, and third-party integrations.',
    'published', false
  )
ON CONFLICT DO NOTHING;

-- Insert sample project images
INSERT INTO public.project_images (project_id, url, "order") 
SELECT id, thumbnail_url, 0 FROM public.projects WHERE slug = 'ai-portfolio-cms'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', 1 FROM public.projects WHERE slug = 'ai-portfolio-cms'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', 2 FROM public.projects WHERE slug = 'ai-portfolio-cms'
ON CONFLICT DO NOTHING;

-- Insert sample testimonials
INSERT INTO public.testimonials (name, role, company, content, rating, status) VALUES
  ('Ahmed Khan', 'CTO', 'TechVentures', 'Ali built our entire backend infrastructure. The system handles millions of requests with zero downtime. Exceptional engineering work.', 5, 'published'),
  ('Sarah Ali', 'Product Manager', 'DataViz Corp', 'The real-time dashboard Ali created transformed how our team makes decisions. Data latency dropped from 15 minutes to under a second.', 5, 'published'),
  ('Usman Malik', 'Founder', 'LegalTech Solutions', 'The RAG document system saved our team hundreds of hours. What used to take days of manual review now takes seconds.', 5, 'published'),
  ('Fatima Ahmed', 'CEO', 'ShopSwift', 'Ali delivered our e-commerce API ahead of schedule. The documentation was superb and the system has been rock solid in production.', 4, 'published')
ON CONFLICT DO NOTHING;

-- Insert sample FAQs
INSERT INTO public.faqs (question, answer, category, "order", active) VALUES
  ('What technologies do you specialize in?', 'I specialize in React.js, Node.js, TypeScript, Python, Supabase, PostgreSQL, and AI/LLM integration. I build full-stack applications with modern architectures.', 'Skills', 1, true),
  ('What is your development process?', 'I follow an agile methodology: discovery & requirements → architecture design → development with iterative reviews → testing → deployment → ongoing support.', 'Process', 2, true),
  ('How long does a typical project take?', 'Timelines vary by scope. A typical web application takes 2-4 weeks, while complex AI systems can take 4-8 weeks. I provide detailed timelines during consultation.', 'Timeline', 3, true),
  ('Do you offer post-launch support?', 'Yes! I provide ongoing maintenance, updates, and feature additions for all projects. Support packages are available on monthly or project basis.', 'Support', 4, true),
  ('How do I get started working with you?', 'Simply reach out through the contact form or email alihassan.webstudio@gmail.com. We''ll schedule a free consultation to discuss your project requirements.', 'General', 5, true)
ON CONFLICT DO NOTHING;

-- Insert sample experience
INSERT INTO public.experience (title, company, location, start_date, end_date, description, current, "order") VALUES
  ('Full-Stack Developer', 'Freelance', 'Gojra, Pakistan', '2024-01-01', NULL, 'Building custom web applications, AI systems, and APIs for clients worldwide. Specializing in React, Node.js, and AI integration.', true, 1),
  ('AI Engineer Intern', 'Tech Solutions Ltd', 'Faisalabad, Pakistan', '2023-06-01', '2024-01-01', 'Developed AI-powered chatbots and RAG systems. Worked on LLM integration, prompt engineering, and database optimization.', false, 2),
  ('Junior Web Developer', 'WebCraft Agency', 'Gojra, Pakistan', '2022-01-01', '2023-06-01', 'Built responsive web applications using React, Node.js, and PostgreSQL. Collaborated on 15+ client projects.', false, 3)
ON CONFLICT DO NOTHING;

-- Insert sample education
INSERT INTO public.education (degree, institution, year, description, status, "order") VALUES
  ('BS Information Technology', 'Akhuwat University', '2024 - Present', 'Currently pursuing a Bachelor''s degree in Information Technology with focus on AI, software engineering, and database systems.', 'active', 1),
  ('ICS (Intermediate)', 'Punjab College', '2022 - 2024', 'Completed Intermediate in Computer Science with distinction. Developed foundation in programming and mathematics.', 'completed', 2),
  ('Matriculation', 'Govt High School', '2020 - 2022', 'Completed secondary education with strong academic record. Developed interest in computers and technology.', 'completed', 3)
ON CONFLICT DO NOTHING;

-- Insert default AI providers
INSERT INTO public.ai_providers (provider_name, api_key, model, status, priority, is_default) VALUES
  ('groq', '', 'openai/gpt-oss-120b', 'active', 1, true),
  ('gemini', '', 'gemini-2.0-flash', 'active', 2, false),
  ('openrouter', '', 'openai/gpt-4o-mini', 'inactive', 3, false)
ON CONFLICT (provider_name) DO NOTHING;

-- Create function to auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
