export type TodoStatus = 'UPCOMING' | 'IN_PROGRESS' | 'OVERDUE' | 'COMPLETED_ON_TIME' | 'COMPLETED_LATE';

export interface Todo {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  is_completed: boolean;
  completed_at: string | null;
  status: TodoStatus;
  created_at: string;
  updated_at: string;
}

export type TodoListItem = Omit<Todo, 'user_id' | 'description'>;

export interface TodoCreateInput {
  title: string;
  description?: string | null;
  start_date: string;
  end_date: string;
}

export type TodoUpdateInput = TodoCreateInput;

export interface TodoListParams {
  status?: TodoStatus;
  sort_by?: 'end_date' | 'start_date' | 'created_at' | 'title';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
