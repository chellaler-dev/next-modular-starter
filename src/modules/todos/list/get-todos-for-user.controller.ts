// features/todos/list/get-todos-for-user.controller.ts
import { getTodosForUserUseCase } from './get-todos-for-user.use-case';
import { AuthenticationService } from '@/src/infrastructure/services/authentication.service';
import { InstrumentationService } from '@/src/infrastructure/services/instrumentation.service';
import { CrashReporterService } from '@/src/infrastructure/services/crash-reporter.service';
import { UnauthenticatedError } from '@/src/modules/shared/errors/auth';
import type { Todo } from '@/src/modules/todos/todo.model';

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
  const instrumentationService = new InstrumentationService();
  const crashReporterService = new CrashReporterService();

  return instrumentationService.startSpan(
    { name: 'getTodosForUser Controller' },
    async () => {
      try {
        // Authentication
        if (!sessionId) {
          throw new UnauthenticatedError('Must be logged in to list todos');
        }

        const authService = new AuthenticationService();
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