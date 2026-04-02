const { calculateStatus } = require('../utils/todoStatus');
const todoQueries = require('../queries/todoQueries');

async function getStatistics(userId) {
  const todos = await todoQueries.findAllByUserId(userId);
  const total = todos.length;

  const byStatus = { UPCOMING: 0, IN_PROGRESS: 0, OVERDUE: 0, COMPLETED_ON_TIME: 0, COMPLETED_LATE: 0 };
  for (const todo of todos) {
    const status = calculateStatus(todo);
    byStatus[status]++;
  }

  const completed = byStatus.COMPLETED_ON_TIME + byStatus.COMPLETED_LATE;
  const completionRate = total > 0 ? Math.round((completed / total) * 10000) / 100 : 0;
  const onTimeRate = completed > 0 ? Math.round((byStatus.COMPLETED_ON_TIME / completed) * 10000) / 100 : 0;
  const overdueCount = byStatus.OVERDUE + byStatus.COMPLETED_LATE;

  return { total, by_status: byStatus, completion_rate: completionRate, on_time_rate: onTimeRate, overdue_count: overdueCount };
}

module.exports = { getStatistics };
