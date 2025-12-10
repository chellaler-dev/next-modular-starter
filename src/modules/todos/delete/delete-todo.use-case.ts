// features/todos/delete/delete-todo.use-case.ts
import { TodosRepository } from '@/src/modules/todos/todos.repository';
import { UnauthorizedError } from '@/src/modules/shared/errors/auth';
import { NotFoundError } from '@/src/modules/shared/errors/common';
import type { Todo } from '@/src/modules/todos/todo.model';

import type {Transaction } from '@/src/infrastructure/database/drizzle';

export async function deleteTodoUseCase(
  input: { todoId: number },
  userId: string,
  tx?: Transaction
): Promise<Todo> {
  const todosRepository = new TodosRepository();

  // Get todo
  const todo = await todosRepository.getTodo(input.todoId);

  if (!todo) {
    throw new NotFoundError('Todo does not exist');
  }

  // Authorization
  if (todo.userId !== userId) {
    throw new UnauthorizedError('Cannot delete todo. Reason: unauthorized');
  }

  // Delete
  await todosRepository.deleteTodo(todo.id, tx);

  return todo;
}