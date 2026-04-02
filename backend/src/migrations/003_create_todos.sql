CREATE TABLE IF NOT EXISTS todos (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title        VARCHAR(200) NOT NULL,
  description  TEXT,
  start_date   DATE        NOT NULL,
  end_date     DATE        NOT NULL,
  is_completed BOOLEAN     NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
