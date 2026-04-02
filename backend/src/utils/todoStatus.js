const STATUSES = {
  UPCOMING: 'UPCOMING',
  IN_PROGRESS: 'IN_PROGRESS',
  OVERDUE: 'OVERDUE',
  COMPLETED_ON_TIME: 'COMPLETED_ON_TIME',
  COMPLETED_LATE: 'COMPLETED_LATE',
};

function toDateOnly(dateStr) {
  const [y, m, d] = String(dateStr).slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
}

function calculateStatus(todo, now = new Date()) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startDate = toDateOnly(todo.start_date);
  const endDate = toDateOnly(todo.end_date);

  if (todo.is_completed) {
    const completedDate = toDateOnly(todo.completed_at);
    return completedDate <= endDate ? STATUSES.COMPLETED_ON_TIME : STATUSES.COMPLETED_LATE;
  }

  if (today < startDate) return STATUSES.UPCOMING;
  if (today > endDate) return STATUSES.OVERDUE;
  return STATUSES.IN_PROGRESS;
}

module.exports = { calculateStatus, STATUSES };
