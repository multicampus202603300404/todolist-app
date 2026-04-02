CREATE TABLE IF NOT EXISTS users (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email      VARCHAR(254) UNIQUE NOT NULL,
  password   VARCHAR(60)  NOT NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
