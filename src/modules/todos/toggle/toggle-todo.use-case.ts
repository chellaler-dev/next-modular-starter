import { UnauthorizedError } from '@/src/modules/shared/errors/auth';
import { NotFoundError } from '@/src/modules/shared/errors/common';
import type { Todo } from '@/src/modules/todos/todo.model';
import type { Transaction } from '@/src/infrastructure/database/drizzle';

import { getTodosRepository } from '@/src/service-locator';

export async function toggleTodoUseCase(
  input: { todoId: number },
  userId: string,
  tx?: Transaction
): Promise<Todo> {
  const todosRepository = getTodosRepository();

  const todo = await todosRepository.getTodo(input.todoId);

  if (!todo) {
    throw new NotFoundError('Todo does not exist');
  }

  if (todo.userId !== userId) {
    throw new UnauthorizedError('Cannot toggle todo. Reason: unauthorized');
  }

  return todosRepository.updateTodo(
    todo.id,
    { completed: !todo.completed },
    tx
  );
}
