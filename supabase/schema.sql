-- ============================================================================
-- LANG TRACKER - Supabase Database Schema
-- ============================================================================
-- 
-- Bu SQL'i Supabase Dashboard > SQL Editor'da çalıştırın
-- https://supabase.com/dashboard/project/YOUR_PROJECT/sql
--
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    username TEXT,
    email TEXT,
    avatar_url TEXT,
    native_language TEXT DEFAULT 'tr',
    target_language TEXT DEFAULT 'en',
    cefr_level TEXT DEFAULT 'B1',
    rotation_strategy TEXT DEFAULT 'CLASSIC',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles için RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Yeni kullanıcı için otomatik profil oluştur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, username)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'user_name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Auth user oluşturulduğunda
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- USER SERIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_series (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    tvmaze_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    image_url TEXT,
    genres TEXT[],
    rotation_strategy TEXT DEFAULT 'CLASSIC',
    language_config JSONB,
    schedule_data JSONB,  -- Sezon programı
    episodes_data JSONB,  -- Bölüm detayları
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, tvmaze_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_user_series_user_id ON user_series(user_id);

-- RLS
ALTER TABLE user_series ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own series" ON user_series
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own series" ON user_series
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own series" ON user_series
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own series" ON user_series
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- PROGRESS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS progress (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    series_id INTEGER REFERENCES user_series ON DELETE CASCADE NOT NULL,
    context_id TEXT NOT NULL,  -- s1-t1-d123 formatı
    episode_id INTEGER,
    season INTEGER,
    episode_number INTEGER,
    tour INTEGER,
    subtitle_mode TEXT,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, series_id, context_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_progress_user_id ON progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_series_id ON progress(series_id);

-- RLS
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress" ON progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON progress
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress" ON progress
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- VOCABULARY TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS vocabulary (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    series_id INTEGER REFERENCES user_series ON DELETE CASCADE,
    episode_id INTEGER,
    word TEXT NOT NULL,
    meaning TEXT,
    context TEXT,  -- Kelimenin geçtiği cümle
    mastery_level INTEGER DEFAULT 0,  -- 0-5 arası
    last_reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_vocabulary_user_id ON vocabulary(user_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_word ON vocabulary(word);

-- RLS
ALTER TABLE vocabulary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own vocabulary" ON vocabulary
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vocabulary" ON vocabulary
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vocabulary" ON vocabulary
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vocabulary" ON vocabulary
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- NOTES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    series_id INTEGER REFERENCES user_series ON DELETE SET NULL,
    episode_id INTEGER,
    title TEXT NOT NULL,
    content TEXT,
    tags TEXT[],
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);

-- RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notes" ON notes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes" ON notes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes" ON notes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes" ON notes
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- WATCHLIST TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS watchlist (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    tvmaze_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    image_url TEXT,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, tvmaze_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON watchlist(user_id);

-- RLS
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own watchlist" ON watchlist
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own watchlist" ON watchlist
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own watchlist" ON watchlist
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- ACTIVITY LOG TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS activity_log (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,  -- 'ADD', 'DELETE', 'WATCH', 'SETTINGS', 'WELCOME', etc.
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at DESC);

-- RLS
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity" ON activity_log
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity" ON activity_log
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- STATISTICS VIEW (optional - istatistikler için)
-- ============================================================================
CREATE OR REPLACE VIEW user_statistics AS
SELECT 
    p.id as user_id,
    p.username,
    COUNT(DISTINCT us.id) as total_series,
    COUNT(DISTINCT pr.id) FILTER (WHERE pr.completed = true) as total_completed_episodes,
    COUNT(DISTINCT v.id) as total_vocabulary,
    COUNT(DISTINCT n.id) as total_notes,
    COUNT(DISTINCT w.id) as watchlist_count
FROM profiles p
LEFT JOIN user_series us ON p.id = us.user_id
LEFT JOIN progress pr ON p.id = pr.user_id
LEFT JOIN vocabulary v ON p.id = v.user_id
LEFT JOIN notes n ON p.id = n.user_id
LEFT JOIN watchlist w ON p.id = w.user_id
GROUP BY p.id, p.username;

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Kullanıcının toplam ilerleme yüzdesini hesapla
CREATE OR REPLACE FUNCTION get_user_progress_percentage(p_user_id UUID)
RETURNS NUMERIC AS $$
DECLARE
    total_slots INTEGER;
    completed_slots INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_slots
    FROM progress
    WHERE user_id = p_user_id;
    
    SELECT COUNT(*) INTO completed_slots
    FROM progress
    WHERE user_id = p_user_id AND completed = true;
    
    IF total_slots = 0 THEN
        RETURN 0;
    END IF;
    
    RETURN ROUND((completed_slots::NUMERIC / total_slots::NUMERIC) * 100, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- DONE! Şema başarıyla oluşturuldu.
-- ============================================================================
