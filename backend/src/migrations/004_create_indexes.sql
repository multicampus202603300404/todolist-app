CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos (user_id);
CREATE INDEX IF NOT EXISTS idx_todos_end_date ON todos (end_date);
CREATE INDEX IF NOT EXISTS idx_todos_user_id_end_date ON todos (user_id, end_date);
