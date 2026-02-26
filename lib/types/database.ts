export type UserRole = "admin" | "moderator" | "member";

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: UserRole;
  is_shoutbox_banned?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  sort_order: number;
  is_admin_only?: boolean;
  category_group?: string | null;
  created_at: string;
}

export interface Thread {
  id: string;
  title: string;
  slug: string;
  content: string;
  author_id: string;
  category_id: string;
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  content: string;
  author_id: string;
  thread_id: string;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
}

export interface Reaction {
  id: string;
  user_id: string;
  post_id: string | null;
  thread_id: string | null;
  type: string;
  created_at: string;
}

export interface ThreadWithDetails extends Thread {
  author: Profile;
  category: Category;
  post_count?: number;
  latest_post?: Post & { author: Profile };
}

export interface PostWithDetails extends Post {
  author: Profile;
  reactions?: Reaction[];
  reaction_count?: number;
  user_reacted?: boolean;
}

export interface CategoryWithStats extends Category {
  thread_count?: number;
  latest_thread?: ThreadWithDetails;
}

export interface Advertisement {
  id: string;
  title: string;
  image_url: string;
  link_url: string;
  description: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface ShoutboxMessage {
  id: string;
  user_id: string;
  content: string;
  channel: string;
  created_at: string;
  author?: Profile;
}

export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface ConversationParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
}

export interface DirectMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: Profile;
}

export interface ConversationWithDetails extends Conversation {
  participants: (ConversationParticipant & { profile: Profile })[];
  last_message?: DirectMessage;
  unread_count?: number;
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at">;
        Update: Partial<Omit<Profile, "id" | "created_at">>;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, "id" | "created_at">;
        Update: Partial<Omit<Category, "id" | "created_at">>;
      };
      threads: {
        Row: Thread;
        Insert: Omit<Thread, "id" | "created_at" | "updated_at" | "view_count">;
        Update: Partial<Omit<Thread, "id" | "created_at">>;
      };
      posts: {
        Row: Post;
        Insert: Omit<Post, "id" | "created_at" | "updated_at" | "is_edited">;
        Update: Partial<Omit<Post, "id" | "created_at">>;
      };
      reactions: {
        Row: Reaction;
        Insert: Omit<Reaction, "id" | "created_at">;
        Update: Partial<Omit<Reaction, "id" | "created_at">>;
      };
    };
  };
};
