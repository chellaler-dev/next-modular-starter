// features/todos/list/get-todos-for-user.use-case.ts
import { TodosRepository } from '@/src//modules/todos/todos.repository';
import type { Todo } from '@/src/modules/todos/todo.model';

export async function getTodosForUserUseCase(userId: string): Promise<Todo[]> {
  const todosRepository = new TodosRepository();
  return todosRepository.getTodosForUser(userId);
}