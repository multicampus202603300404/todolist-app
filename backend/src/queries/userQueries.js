const { query } = require('../config/db');

async function createUser(email, hashedPassword) {
  const result = await query(
    'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email, created_at',
    [email, hashedPassword]
  );
  return result.rows[0];
}

async function findUserByEmail(email) {
  const result = await query(
    'SELECT id, email, password, created_at FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;
}

async function findUserById(id) {
  const result = await query(
    'SELECT id, email, created_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

module.exports = { createUser, findUserByEmail, findUserById };
