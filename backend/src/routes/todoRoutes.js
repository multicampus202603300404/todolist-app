const { Router } = require('express');
const todoController = require('../controllers/todoController');
const authenticate = require('../middlewares/authenticate');
const validate = require('../middlewares/validate');

const router = Router();

router.use(authenticate);

const todoCreateSchema = {
  body: {
    title: { required: true, type: 'string', maxLength: 200 },
    description: { type: 'string', maxLength: 2000 },
    start_date: { required: true, type: 'string' },
    end_date: { required: true, type: 'string' },
  },
};

const todoUpdateSchema = todoCreateSchema;

// statistics must come before :id
router.get('/statistics', todoController.statistics);
router.post('/', validate(todoCreateSchema), todoController.create);
router.get('/', todoController.list);
router.get('/:id', todoController.getById);
router.put('/:id', validate(todoUpdateSchema), todoController.update);
router.delete('/:id', todoController.remove);
router.patch('/:id/complete', todoController.complete);
router.patch('/:id/uncomplete', todoController.uncomplete);

module.exports = router;
