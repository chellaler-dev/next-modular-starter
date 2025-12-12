import type { Todo } from '@/src/modules/todos/todo.model';

import { getTodosRepository } from '@/src/service-locator';

export async function getTodosForUserUseCase(userId: string): Promise<Todo[]> {
  const todosRepository = getTodosRepository();
  return todosRepository.getTodosForUser(userId);
}
