-- Seed data: Categories
INSERT INTO categories (name, slug, description, icon, color, sort_order)
VALUES
  ('General Discussion', 'general', 'Talk about anything and everything with the community.', '💬', '#6366f1', 1),
  ('Announcements', 'announcements', 'Official announcements, news, and updates from the team.', '📢', '#f59e0b', 2),
  ('Help & Support', 'help', 'Get help from the community. Ask questions and find answers.', '🆘', '#10b981', 3),
  ('Feature Requests', 'feature-requests', 'Suggest new features and improvements for the platform.', '💡', '#8b5cf6', 4),
  ('Off Topic', 'off-topic', 'Random conversations, memes, and anything else that doesn''t fit elsewhere.', '🎲', '#ec4899', 5),
  ('Showcase', 'showcase', 'Show off your projects, creations, and achievements to the community.', '🌟', '#f97316', 6)
ON CONFLICT (slug) DO NOTHING;
