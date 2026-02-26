-- PumpTalk Features Migration

-- Add columns to existing tables
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_shoutbox_banned BOOLEAN DEFAULT false;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_admin_only BOOLEAN DEFAULT false;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS category_group TEXT;

-- ============================
-- SHOUTBOX MESSAGES TABLE
-- ============================
CREATE TABLE IF NOT EXISTS shoutbox_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE shoutbox_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shoutbox messages are viewable by everyone" ON shoutbox_messages
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can post to shoutbox" ON shoutbox_messages
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    auth.uid() = user_id AND
    NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_shoutbox_banned = true)
  );

CREATE POLICY "Users can delete their own shoutbox messages" ON shoutbox_messages
  FOR DELETE USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================
-- CONVERSATIONS TABLE
-- ============================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view their conversations" ON conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================
-- CONVERSATION PARTICIPANTS TABLE
-- ============================
CREATE TABLE IF NOT EXISTS conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  UNIQUE (conversation_id, user_id)
);

ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view conversation participants" ON conversation_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp2
      WHERE cp2.conversation_id = conversation_id AND cp2.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can join conversations" ON conversation_participants
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================
-- DIRECT MESSAGES TABLE
-- ============================
CREATE TABLE IF NOT EXISTS direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view their direct messages" ON direct_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = direct_messages.conversation_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Participants can send messages" ON direct_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = direct_messages.conversation_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Participants can update read status" ON direct_messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = direct_messages.conversation_id AND user_id = auth.uid()
    )
  );

-- ============================
-- ADVERTISEMENTS TABLE
-- ============================
CREATE TABLE IF NOT EXISTS advertisements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Advertisements are viewable by everyone" ON advertisements
  FOR SELECT USING (is_active = true OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Only admins can manage advertisements" ON advertisements
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Enable realtime on shoutbox and direct messages
ALTER PUBLICATION supabase_realtime ADD TABLE shoutbox_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE direct_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

-- Update conversations.updated_at trigger
CREATE OR REPLACE FUNCTION update_conversation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations SET updated_at = now() WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS direct_messages_update_conversation ON direct_messages;
CREATE OR REPLACE TRIGGER direct_messages_update_conversation
  AFTER INSERT ON direct_messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_updated_at();
