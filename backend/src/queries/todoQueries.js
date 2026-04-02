const { query } = require('../config/db');

const SORT_WHITELIST = ['end_date', 'start_date', 'created_at', 'title'];
const ORDER_WHITELIST = ['asc', 'desc'];

async function createTodo(userId, data) {
  const result = await query(
    `INSERT INTO todos (user_id, title, description, start_date, end_date)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [userId, data.title, data.description || null, data.start_date, data.end_date]
  );
  return result.rows[0];
}

async function findTodoById(todoId, userId) {
  const result = await query(
    'SELECT * FROM todos WHERE id = $1 AND user_id = $2',
    [todoId, userId]
  );
  return result.rows[0] || null;
}

async function findTodos(userId, { sort_by = 'created_at', order = 'desc', page = 1, limit = 20 }) {
  const sortCol = SORT_WHITELIST.includes(sort_by) ? sort_by : 'created_at';
  const sortOrder = ORDER_WHITELIST.includes(order) ? order.toUpperCase() : 'DESC';
  const offset = (page - 1) * limit;

  const countResult = await query(
    'SELECT COUNT(*) FROM todos WHERE user_id = $1',
    [userId]
  );
  const total = parseInt(countResult.rows[0].count, 10);

  const dataResult = await query(
    `SELECT * FROM todos WHERE user_id = $1
     ORDER BY ${sortCol} ${sortOrder}
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  return { data: dataResult.rows, total, page, limit };
}

async function updateTodo(todoId, userId, data) {
  const result = await query(
    `UPDATE todos SET title = $1, description = $2, start_date = $3, end_date = $4
     WHERE id = $5 AND user_id = $6
     RETURNING *`,
    [data.title, data.description || null, data.start_date, data.end_date, todoId, userId]
  );
  return result.rows[0] || null;
}

async function deleteTodo(todoId, userId) {
  const result = await query(
    'DELETE FROM todos WHERE id = $1 AND user_id = $2 RETURNING id',
    [todoId, userId]
  );
  return result.rows[0] || null;
}

async function completeTodo(todoId, userId) {
  const result = await query(
    `UPDATE todos SET is_completed = true, completed_at = NOW()
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [todoId, userId]
  );
  return result.rows[0] || null;
}

async function uncompleteTodo(todoId, userId) {
  const result = await query(
    `UPDATE todos SET is_completed = false, completed_at = NULL
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [todoId, userId]
  );
  return result.rows[0] || null;
}

async function findAllByUserId(userId) {
  const result = await query('SELECT * FROM todos WHERE user_id = $1', [userId]);
  return result.rows;
}

module.exports = { createTodo, findTodoById, findTodos, updateTodo, deleteTodo, completeTodo, uncompleteTodo, findAllByUserId };
