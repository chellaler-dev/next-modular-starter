import { InputParseError } from '@/src/modules/shared/errors/common';
import type { Todo } from '@/src/modules/todos/todo.model';

import { getTodosRepository } from '@/src/service-locator';

export async function createTodoUseCase(
  input: { todo: string },
  userId: string,
  tx?: any
): Promise<Todo> {
  if (input.todo.length < 4) {
    throw new InputParseError('Todo must be at least 4 chars');
  }

  const todosRepository = getTodosRepository();

  return todosRepository.createTodo(
    {
      todo: input.todo,
      userId,
      completed: false,
    },
    tx
  );
}
