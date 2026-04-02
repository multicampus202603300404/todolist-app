import api from './axiosInstance';
import type { Todo, TodoListItem, TodoCreateInput, TodoUpdateInput, TodoListParams, PaginatedResponse, TodoStatistics } from '@/types';

export const todosApi = {
  createTodo: (data: TodoCreateInput) =>
    api.post<Todo>('/api/todos', data).then((r) => r.data),

  getTodos: (params?: TodoListParams) =>
    api.get<PaginatedResponse<TodoListItem>>('/api/todos', { params }).then((r) => r.data),

  getTodoById: (id: string) =>
    api.get<Todo>(`/api/todos/${id}`).then((r) => r.data),

  updateTodo: (id: string, data: TodoUpdateInput) =>
    api.put<Todo>(`/api/todos/${id}`, data).then((r) => r.data),

  deleteTodo: (id: string) =>
    api.delete(`/api/todos/${id}`),

  completeTodo: (id: string) =>
    api.patch<Todo>(`/api/todos/${id}/complete`).then((r) => r.data),

  uncompleteTodo: (id: string) =>
    api.patch<Todo>(`/api/todos/${id}/uncomplete`).then((r) => r.data),

  getStatistics: () =>
    api.get<TodoStatistics>('/api/todos/statistics').then((r) => r.data),
};
