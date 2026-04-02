const AppError = require('../utils/AppError');
const { calculateStatus } = require('../utils/todoStatus');
const todoQueries = require('../queries/todoQueries');

function attachStatus(todo) {
  return { ...todo, status: calculateStatus(todo) };
}

async function createTodo(userId, data) {
  if (new Date(data.end_date) < new Date(data.start_date)) {
    throw new AppError(400, 'INVALID_DATE_RANGE', '종료일은 시작일 이후여야 합니다');
  }
  const todo = await todoQueries.createTodo(userId, data);
  return attachStatus(todo);
}

async function getTodoById(userId, todoId) {
  const todo = await todoQueries.findTodoById(todoId, userId);
  if (!todo) throw new AppError(404, 'TODO_NOT_FOUND', '할일을 찾을 수 없습니다');
  return attachStatus(todo);
}

async function getTodos(userId, filters) {
  const result = await todoQueries.findTodos(userId, filters);
  const totalPages = Math.ceil(result.total / result.limit) || 0;
  return {
    data: result.data.map(attachStatus),
    pagination: { total: result.total, page: result.page, limit: result.limit, totalPages },
  };
}

async function updateTodo(userId, todoId, data) {
  if (new Date(data.end_date) < new Date(data.start_date)) {
    throw new AppError(400, 'INVALID_DATE_RANGE', '종료일은 시작일 이후여야 합니다');
  }
  const todo = await todoQueries.updateTodo(todoId, userId, data);
  if (!todo) throw new AppError(404, 'TODO_NOT_FOUND', '할일을 찾을 수 없습니다');
  return attachStatus(todo);
}

async function deleteTodo(userId, todoId) {
  const result = await todoQueries.deleteTodo(todoId, userId);
  if (!result) throw new AppError(404, 'TODO_NOT_FOUND', '할일을 찾을 수 없습니다');
}

async function completeTodo(userId, todoId) {
  const existing = await todoQueries.findTodoById(todoId, userId);
  if (!existing) throw new AppError(404, 'TODO_NOT_FOUND', '할일을 찾을 수 없습니다');
  if (existing.is_completed) throw new AppError(409, 'ALREADY_COMPLETED', '이미 완료된 할일입니다');
  const todo = await todoQueries.completeTodo(todoId, userId);
  return attachStatus(todo);
}

async function uncompleteTodo(userId, todoId) {
  const existing = await todoQueries.findTodoById(todoId, userId);
  if (!existing) throw new AppError(404, 'TODO_NOT_FOUND', '할일을 찾을 수 없습니다');
  if (!existing.is_completed) throw new AppError(409, 'NOT_COMPLETED', '완료되지 않은 할일입니다');
  const todo = await todoQueries.uncompleteTodo(todoId, userId);
  return attachStatus(todo);
}

module.exports = { createTodo, getTodoById, getTodos, updateTodo, deleteTodo, completeTodo, uncompleteTodo };
