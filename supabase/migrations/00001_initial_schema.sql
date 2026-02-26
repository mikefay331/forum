-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================
-- PROFILES TABLE
-- ============================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================
-- CATEGORIES TABLE
-- ============================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage categories" ON categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================
-- THREADS TABLE
-- ============================
CREATE TABLE IF NOT EXISTS threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  view_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Threads are viewable by everyone" ON threads
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create threads" ON threads
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = author_id);

CREATE POLICY "Authors can update their threads" ON threads
  FOR UPDATE USING (
    auth.uid() = author_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Authors and admins can delete threads" ON threads
  FOR DELETE USING (
    auth.uid() = author_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================
-- POSTS TABLE
-- ============================
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  is_edited BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Posts are viewable by everyone" ON posts
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts on unlocked threads" ON posts
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    auth.uid() = author_id AND
    NOT EXISTS (
      SELECT 1 FROM threads
      WHERE id = thread_id AND is_locked = true
    )
  );

CREATE POLICY "Authors can update their own posts" ON posts
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors and mods can delete posts" ON posts
  FOR DELETE USING (
    auth.uid() = author_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- ============================
-- REACTIONS TABLE
-- ============================
CREATE TABLE IF NOT EXISTS reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  thread_id UUID REFERENCES threads(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'like',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT reactions_post_unique UNIQUE (user_id, post_id),
  CONSTRAINT reactions_thread_unique UNIQUE (user_id, thread_id),
  CONSTRAINT reactions_target_check CHECK (
    (post_id IS NOT NULL AND thread_id IS NULL) OR
    (post_id IS NULL AND thread_id IS NOT NULL)
  )
);

ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reactions are viewable by everyone" ON reactions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage their own reactions" ON reactions
  FOR ALL USING (auth.uid() = user_id);

-- ============================
-- FUNCTIONS & TRIGGERS
-- ============================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INT := 0;
BEGIN
  base_username := lower(regexp_replace(split_part(NEW.email, '@', 1), '[^a-z0-9]', '', 'g'));
  IF length(base_username) < 3 THEN
    base_username := 'user';
  END IF;
  final_username := base_username;

  WHILE EXISTS (SELECT 1 FROM profiles WHERE username = final_username) LOOP
    counter := counter + 1;
    final_username := base_username || counter::TEXT;
  END LOOP;

  INSERT INTO profiles (id, username, display_name, role)
  VALUES (
    NEW.id,
    final_username,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.raw_user_meta_data->>'full_name', final_username),
    'member'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Increment view count
CREATE OR REPLACE FUNCTION increment_view_count(thread_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE threads SET view_count = view_count + 1 WHERE id = thread_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- updated_at auto-update
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER threads_updated_at
  BEFORE UPDATE ON threads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Enable realtime for posts
ALTER PUBLICATION supabase_realtime ADD TABLE posts;
