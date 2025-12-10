// features/todos/toggle/toggle-todo.controller.ts
import { z } from 'zod';

import { toggleTodoUseCase } from './toggle-todo.use-case';
import { AuthenticationService } from '@/src/infrastructure/services/authentication.service';
import { InstrumentationService } from '@/src/infrastructure/services/instrumentation.service';
import { CrashReporterService } from '@/src/infrastructure/services/crash-reporter.service';
import { UnauthenticatedError } from '@/src/modules/shared/errors/auth';
import { InputParseError } from '@/src/modules/shared/errors/common';
import type { Todo } from '@/src/modules/todos/todo.model';

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
  const instrumentationService = new InstrumentationService();
  const crashReporterService = new CrashReporterService();

  return instrumentationService.startSpan(
    { name: 'toggleTodo Controller' },
    async () => {
      try {
        // Authentication
        if (!sessionId) {
          throw new UnauthenticatedError('Must be logged in to toggle todo');
        }

        const authService = new AuthenticationService();
        const { session } = await authService.validateSession(sessionId);

        // Input validation
        const { data, error: inputParseError } = inputSchema.safeParse(input);
        if (inputParseError) {
          throw new InputParseError('Invalid data', { cause: inputParseError });
        }

        // Toggle todo
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