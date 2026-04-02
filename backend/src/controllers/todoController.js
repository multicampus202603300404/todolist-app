const todoService = require('../services/todoService');
const statsService = require('../services/statsService');

async function create(req, res, next) {
  try {
    const todo = await todoService.createTodo(req.user.id, req.body);
    res.status(201).json(todo);
  } catch (err) { next(err); }
}

async function list(req, res, next) {
  try {
    const filters = {
      status: req.query.status || undefined,
      sort_by: req.query.sort_by || 'created_at',
      order: req.query.order || 'desc',
      page: parseInt(req.query.page, 10) || 1,
      limit: parseInt(req.query.limit, 10) || 20,
    };
    const result = await todoService.getTodos(req.user.id, filters);
    res.status(200).json(result);
  } catch (err) { next(err); }
}

async function getById(req, res, next) {
  try {
    const todo = await todoService.getTodoById(req.user.id, req.params.id);
    res.status(200).json(todo);
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const todo = await todoService.updateTodo(req.user.id, req.params.id, req.body);
    res.status(200).json(todo);
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    await todoService.deleteTodo(req.user.id, req.params.id);
    res.status(204).send();
  } catch (err) { next(err); }
}

async function complete(req, res, next) {
  try {
    const todo = await todoService.completeTodo(req.user.id, req.params.id);
    res.status(200).json(todo);
  } catch (err) { next(err); }
}

async function uncomplete(req, res, next) {
  try {
    const todo = await todoService.uncompleteTodo(req.user.id, req.params.id);
    res.status(200).json(todo);
  } catch (err) { next(err); }
}

async function statistics(req, res, next) {
  try {
    const stats = await statsService.getStatistics(req.user.id);
    res.status(200).json(stats);
  } catch (err) { next(err); }
}

module.exports = { create, list, getById, update, remove, complete, uncomplete, statistics };
