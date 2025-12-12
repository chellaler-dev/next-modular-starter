import { z } from 'zod';

import { toggleTodoUseCase } from './toggle-todo.use-case';
import { UnauthenticatedError } from '@/src/modules/shared/errors/auth';
import { InputParseError } from '@/src/modules/shared/errors/common';
import type { Todo } from '@/src/modules/todos/todo.model';

import {
  getAuthenticationService,
  getInstrumentationService,
  getCrashReporterService,
} from '@/src/service-locator';

const inputSchema = z.object({ todoId: z.number() });

function presenter(todo: Todo) {
  return {
    id: todo.id,
    todo: todo.todo,
    userId: todo.userId,
    completed: todo.completed,
  };
}

export async function toggleTodoController(
  input: Partial<z.infer<typeof inputSchema>>,
  sessionId: string | undefined
): Promise<ReturnType<typeof presenter>> {
  const instrumentationService = getInstrumentationService();
  const crashReporterService = getCrashReporterService();

  return instrumentationService.startSpan(
    { name: 'toggleTodo Controller' },
    async () => {
      try {
        if (!sessionId) {
          throw new UnauthenticatedError('Must be logged in to toggle todo');
        }

        const authService = getAuthenticationService();
        const { session } = await authService.validateSession(sessionId);

        const { data, error: inputParseError } = inputSchema.safeParse(input);
        if (inputParseError) {
          throw new InputParseError('Invalid data', { cause: inputParseError });
        }

        const todo = await toggleTodoUseCase(
          { todoId: data.todoId },
          session.userId
        );

        return presenter(todo);
      } catch (error) {
        crashReporterService.report(error);
        throw error;
      }
    }
  );
}
