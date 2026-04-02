export interface TodoStatistics {
  total: number;
  by_status: {
    UPCOMING: number;
    IN_PROGRESS: number;
    OVERDUE: number;
    COMPLETED_ON_TIME: number;
    COMPLETED_LATE: number;
  };
  completion_rate: number;
  on_time_rate: number;
  overdue_count: number;
}
