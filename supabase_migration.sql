-- ============================================================
-- FASHIONIST'ART — Migration Base44 → Supabase
-- Toutes les tables avec RLS
-- ============================================================

-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================
-- ARTISTS
-- ========================
CREATE TABLE IF NOT EXISTS artists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  stage_name TEXT,
  email TEXT,
  phone TEXT,
  discipline TEXT NOT NULL,
  category TEXT,
  photo_url TEXT,
  short_bio TEXT,
  full_bio TEXT,
  website TEXT,
  instagram TEXT,
  facebook TEXT,
  tiktok TEXT,
  youtube TEXT,
  linkedin TEXT,
  consent_diffusion BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('active','inactive','pending','approved','rejected')),
  performance_time TEXT,
  show_on_site BOOLEAN DEFAULT FALSE,
  owner_user_id TEXT,
  share_slug TEXT UNIQUE,
  info_request_token TEXT,
  info_request_token_expires_at TIMESTAMPTZ,
  display_order INTEGER DEFAULT 0,
  promo_video_url TEXT,
  works JSONB DEFAULT '[]'
);

-- ========================
-- ARTIST WORKS
-- ========================
CREATE TABLE IF NOT EXISTS artist_works (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0
);

-- ========================
-- ARTIST BIO GENERATED
-- ========================
CREATE TABLE IF NOT EXISTS artist_bio_generated (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  bio_text TEXT,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================
-- ARTIST DAILY SPOTLIGHTS
-- ========================
CREATE TABLE IF NOT EXISTS artist_daily_spotlights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  spotlight_date DATE DEFAULT CURRENT_DATE,
  message TEXT
);

-- ========================
-- GALLERY MEDIA
-- ========================
CREATE TABLE IF NOT EXISTS gallery_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('photo','video','document')),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  edition TEXT DEFAULT '2025',
  artist_name TEXT,
  category TEXT,
  display_order INTEGER DEFAULT 0,
  date DATE,
  drive_file_id TEXT
);

-- ========================
-- BLOG POSTS
-- ========================
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  category TEXT CHECK (category IN ('coulisses','tendances','artistes','evenement','actualites')),
  cover_image_url TEXT,
  excerpt TEXT,
  content TEXT,
  author_name TEXT,
  author_avatar_url TEXT,
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  tags TEXT[],
  reading_time INTEGER
);

-- ========================
-- CONTACT MESSAGES
-- ========================
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT,
  email TEXT,
  subject TEXT,
  message TEXT,
  read BOOLEAN DEFAULT FALSE
);

-- ========================
-- HISTORY PAGES
-- ========================
CREATE TABLE IF NOT EXISTS history_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT DEFAULT 'Histoire de Fashionist''ART',
  content_html TEXT NOT NULL,
  content_text TEXT,
  year_start INTEGER,
  last_updated_at TIMESTAMPTZ,
  approved_by_name TEXT,
  approved_at TIMESTAMPTZ
);

-- ========================
-- HISTORY DRAFTS
-- ========================
CREATE TABLE IF NOT EXISTS history_drafts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT,
  content_html TEXT,
  content_text TEXT,
  status TEXT DEFAULT 'draft'
);

-- ========================
-- HOMEPAGE CONFIGS
-- ========================
CREATE TABLE IF NOT EXISTS homepage_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  intro_enabled BOOLEAN DEFAULT TRUE,
  intro_video_url TEXT,
  intro_image_url TEXT,
  intro_duration_seconds INTEGER DEFAULT 5,
  featured_posts JSONB DEFAULT '[]',
  updated_at_custom TIMESTAMPTZ
);

-- ========================
-- MISS MISTER RESERVATIONS
-- ========================
CREATE TABLE IF NOT EXISTS miss_mister_reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  category TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending'
);

-- ========================
-- NEWSLETTER CAMPAIGNS
-- ========================
CREATE TABLE IF NOT EXISTS newsletter_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  subject TEXT,
  content TEXT,
  sent_at TIMESTAMPTZ,
  recipient_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft'
);

-- ========================
-- NEWSLETTER SUBSCRIBERS
-- ========================
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  consent BOOLEAN NOT NULL,
  consent_date TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed BOOLEAN DEFAULT FALSE,
  unsubscribed_date TIMESTAMPTZ,
  unsubscribe_token TEXT,
  source TEXT DEFAULT 'website'
);

-- ========================
-- ORGANIZERS
-- ========================
CREATE TABLE IF NOT EXISTS organizers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT,
  role TEXT,
  email TEXT,
  phone TEXT,
  photo_url TEXT
);

-- ========================
-- PARTICIPANT FORMS
-- ========================
CREATE TABLE IF NOT EXISTS participant_forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  artist_id UUID REFERENCES artists(id),
  data JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending',
  submitted_at TIMESTAMPTZ
);

-- ========================
-- PARTNERS
-- ========================
CREATE TABLE IF NOT EXISTS partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  category TEXT CHECK (category IN ('technique','institutionnel','sponsor','media','artistique','autre')),
  website TEXT,
  logo_file TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  tags TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','pending_approval','approved','rejected')),
  "order" INTEGER DEFAULT 0,
  created_by_user_id TEXT,
  approved_by_user_id TEXT,
  approved_at TIMESTAMPTZ
);

-- ========================
-- PLATFORM FEE RULES
-- ========================
CREATE TABLE IF NOT EXISTS platform_fee_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT,
  percentage NUMERIC,
  active BOOLEAN DEFAULT TRUE
);

-- ========================
-- PROGRAM EVENTS
-- ========================
CREATE TABLE IF NOT EXISTS program_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  category TEXT CHECK (category IN ('performance','atelier','exposition','conference')),
  start_time TEXT NOT NULL,
  end_time TEXT,
  location TEXT,
  description TEXT,
  artist_ids TEXT[]
);

-- ========================
-- REGISTRATIONS
-- ========================
CREATE TABLE IF NOT EXISTS registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  accepts_terms BOOLEAN,
  accepts_contact BOOLEAN
);

-- ========================
-- SALES
-- ========================
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  artist_id UUID REFERENCES artists(id),
  artwork_title TEXT,
  amount NUMERIC,
  status TEXT DEFAULT 'pending',
  buyer_email TEXT
);

-- ========================
-- SITE NEWS
-- ========================
CREATE TABLE IF NOT EXISTS site_news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  media_url TEXT,
  published_at TIMESTAMPTZ NOT NULL,
  source_post_id TEXT
);

-- ========================
-- SOCIAL POST DRAFTS
-- ========================
CREATE TABLE IF NOT EXISTS social_post_drafts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  platform TEXT,
  content TEXT,
  image_url TEXT,
  scheduled_at TIMESTAMPTZ,
  status TEXT DEFAULT 'draft',
  published_at TIMESTAMPTZ
);

-- ========================
-- TESTIMONIALS
-- ========================
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  role TEXT,
  text TEXT NOT NULL,
  avatar_url TEXT,
  display_order INTEGER DEFAULT 0
);

-- ========================
-- RLS — Activer sur toutes les tables
-- ========================
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_works ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Lecture publique (sans auth) pour galerie, blog, partenaires, témoignages, news
CREATE POLICY "gallery_public_read" ON gallery_media FOR SELECT USING (true);
CREATE POLICY "blog_public_read" ON blog_posts FOR SELECT USING (published = true);
CREATE POLICY "partners_public_read" ON partners FOR SELECT USING (status = 'approved');
CREATE POLICY "testimonials_public_read" ON testimonials FOR SELECT USING (true);
CREATE POLICY "site_news_public_read" ON site_news FOR SELECT USING (true);
CREATE POLICY "artists_public_read" ON artists FOR SELECT USING (show_on_site = true OR status IN ('active','approved'));

-- Insert public (newsletter, registrations, contact)
CREATE POLICY "newsletter_public_insert" ON newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "registrations_public_insert" ON registrations FOR INSERT WITH CHECK (true);

-- ========================
-- TRIGGER updated_at
-- ========================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON artists FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON gallery_media FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON partners FOR EACH ROW EXECUTE FUNCTION update_updated_at();
