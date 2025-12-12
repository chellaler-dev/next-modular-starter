import { z } from 'zod';

import { createTodoUseCase } from './create-todo.use-case';
import { UnauthenticatedError } from '@/src/modules/shared/errors/auth';
import { InputParseError } from '@/src/modules/shared/errors/common';
import type { Todo } from '@/src/modules/todos/todo.model';

import {
  getAuthenticationService,
  getTransactionManagerService,
  getInstrumentationService,
  getCrashReporterService,
} from '@/src/service-locator';

const inputSchema = z.object({ todo: z.string().min(1) });

function presenter(todos: Todo[]) {
  return todos.map((todo) => ({
    id: todo.id,
    todo: todo.todo,
    userId: todo.userId,
    completed: todo.completed,
  }));
}

export async function createTodoController(
  input: Partial<z.infer<typeof inputSchema>>,
  sessionId: string | undefined
): Promise<ReturnType<typeof presenter>> {
  const instrumentationService = getInstrumentationService();
  const crashReporterService = getCrashReporterService();

  return instrumentationService.startSpan(
    { name: 'createTodo Controller' },
    async () => {
      try {
        // Authentication
        if (!sessionId) {
          throw new UnauthenticatedError('Must be logged in to create a todo');
        }

        const authService = getAuthenticationService();
        const { user } = await authService.validateSession(sessionId);

        // Input validation
        const { data, error: inputParseError } = inputSchema.safeParse(input);
        if (inputParseError) {
          throw new InputParseError('Invalid data', { cause: inputParseError });
        }

        // Handle comma-separated todos
        const todosFromInput = data.todo.split(',').map((t) => t.trim());

        // Create todos in transaction
        const transactionService = getTransactionManagerService();

        const todos = await transactionService.startTransaction(async (tx) => {
          try {
            return await Promise.all(
              todosFromInput.map((t) =>
                createTodoUseCase({ todo: t }, user.id, tx)
              )
            );
          } catch (err) {
            console.error('Rolling back!');
            tx.rollback();
            throw err;
          }
        });

        return presenter(todos ?? []);
      } catch (error) {
        crashReporterService.report(error);
        throw error;
      }
    }
  );
}
