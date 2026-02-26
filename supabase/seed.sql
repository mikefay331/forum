-- Seed data: Categories
INSERT INTO categories (name, slug, description, icon, color, category_group, is_admin_only, sort_order)
VALUES
  ('General Discussion', 'general', 'Talk about anything and everything with the community.', '💬', '#6366f1', 'PumpTalk Forums', false, 1),
  ('Announcements', 'announcements', 'Official announcements, news, and updates from the team.', '📢', '#f59e0b', 'PumpTalk Forums', true, 2),
  ('Help & Support', 'help', 'Get help from the community. Ask questions and find answers.', '🆘', '#10b981', 'PumpTalk Forums', false, 3),
  ('Feature Requests', 'feature-requests', 'Suggest new features and improvements for the platform.', '💡', '#8b5cf6', 'Community', false, 4),
  ('Off Topic', 'off-topic', 'Random conversations, memes, and anything else.', '🎲', '#ec4899', 'Community', false, 5),
  ('Showcase', 'showcase', 'Show off your projects, creations, and achievements.', '🌟', '#f97316', 'Community', false, 6),
  ('Giveaways', 'giveaways', 'Community giveaways and rewards.', '🎁', '#2a9d8f', 'PumpTalk Forums', true, 7),
  ('Marketplace', 'marketplace', 'Buy, sell, and trade with community members.', '🛒', '#06b6d4', 'Community', false, 8)
ON CONFLICT (slug) DO UPDATE SET
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  category_group = EXCLUDED.category_group,
  is_admin_only = EXCLUDED.is_admin_only,
  sort_order = EXCLUDED.sort_order;
