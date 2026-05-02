-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users
CREATE TABLE users (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         VARCHAR(100) NOT NULL,
  email        VARCHAR(255) UNIQUE,
  password     VARCHAR(255), -- Hashed
  google_id    VARCHAR(255) UNIQUE,
  phone        VARCHAR(20) UNIQUE,
  avatar_url   VARCHAR(500),
  city         VARCHAR(100),
  state        VARCHAR(100),
  role         VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_active    BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Posts
CREATE TABLE posts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content      TEXT NOT NULL,
  media_url    VARCHAR(500),
  media_type   VARCHAR(10) DEFAULT 'none' CHECK (media_type IN ('image', 'video', 'none')),
  post_type    VARCHAR(20) CHECK (post_type IN ('achievement', 'complaint', 'action', 'other')),
  location     VARCHAR(200),
  is_hidden    BOOLEAN NOT NULL DEFAULT FALSE,
  is_deleted   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Comments
CREATE TABLE comments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id      UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content      TEXT NOT NULL,
  is_hidden    BOOLEAN NOT NULL DEFAULT FALSE,
  is_deleted   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Post likes (unique constraint prevents duplicate likes)
CREATE TABLE post_likes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id      UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (post_id, user_id)
);

-- Tags
CREATE TABLE post_tags (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         VARCHAR(100) NOT NULL UNIQUE
);

-- Post <-> Tag mapping
CREATE TABLE post_tag_map (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id      UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id       UUID NOT NULL REFERENCES post_tags(id) ON DELETE CASCADE,
  UNIQUE (post_id, tag_id)
);

-- Reports
CREATE TABLE reports (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type    VARCHAR(10) NOT NULL CHECK (target_type IN ('post', 'comment')),
  target_id      UUID NOT NULL,
  reason         VARCHAR(50) NOT NULL CHECK (reason IN ('abuse', 'spam', 'misinformation', 'other')),
  description    TEXT,
  status         VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'rejected')),
  reviewed_by    UUID REFERENCES users(id),
  action_taken   VARCHAR(20) CHECK (action_taken IN ('deleted', 'warning', 'none')),
  created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
  reviewed_at    TIMESTAMP
);

-- Indexes for common query patterns
CREATE INDEX idx_posts_user_id     ON posts(user_id);
CREATE INDEX idx_posts_created_at  ON posts(created_at DESC);
CREATE INDEX idx_comments_post_id  ON comments(post_id);
CREATE INDEX idx_post_likes_post   ON post_likes(post_id);
CREATE INDEX idx_post_tag_map_post ON post_tag_map(post_id);
CREATE INDEX idx_reports_status    ON reports(status);

-- Auto-update updated_at on posts
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at(); 