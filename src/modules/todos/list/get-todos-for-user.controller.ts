import { getTodosForUserUseCase } from './get-todos-for-user.use-case';
import { UnauthenticatedError } from '@/src/modules/shared/errors/auth';
import type { Todo } from '@/src/modules/todos/todo.model';

import {
  getAuthenticationService,
  getInstrumentationService,
  getCrashReporterService,
} from '@/src/service-locator';

function presenter(todos: Todo[]) {
  return todos.map((t) => ({
    id: t.id,
    todo: t.todo,
    userId: t.userId,
    completed: t.completed,
  }));
}

export async function getTodosForUserController(
  sessionId: string | undefined
): Promise<ReturnType<typeof presenter>> {
  const instrumentationService = getInstrumentationService();
  const crashReporterService = getCrashReporterService();

  return instrumentationService.startSpan(
    { name: 'getTodosForUser Controller' },
    async () => {
      try {
        // Authentication
        if (!sessionId) {
          throw new UnauthenticatedError('Must be logged in to list todos');
        }

        const authService = getAuthenticationService();
        const { session } = await authService.validateSession(sessionId);

        // Get todos
        const todos = await getTodosForUserUseCase(session.userId);

        return presenter(todos);
      } catch (error) {
        crashReporterService.report(error);
        throw error;
      }
    }
  );
}
