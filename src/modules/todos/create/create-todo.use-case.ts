// features/todos/create/create-todo.use-case.ts
import { TodosRepository } from '@/src/modules/todos/todos.repository';
import { InputParseError } from '@/src/modules/shared/errors/common';
import type { Todo } from '@/src/modules/todos/todo.model';

export async function createTodoUseCase(
  input: { todo: string },
  userId: string,
  tx?: any
): Promise<Todo> {
  // Business validation
  if (input.todo.length < 4) {
    throw new InputParseError('Todo must be at least 4 chars');
  }

  // Authorization check example:
  // const todosRepo = new TodosRepository();
  // const userTodos = await todosRepo.getTodosForUser(userId);
  // if (userTodos.length >= 5) {
  //   throw new UnauthorizedError('Free users limited to 5 todos');
  // }

  const todosRepository = new TodosRepository();
  return todosRepository.createTodo(
    {
      todo: input.todo,
      userId,
      completed: false,
    },
    tx
  );
}