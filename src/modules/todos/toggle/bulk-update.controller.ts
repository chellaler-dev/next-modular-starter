import { z } from 'zod';

import { toggleTodoUseCase } from '@/src/modules/todos/toggle/toggle-todo.use-case';
import { deleteTodoUseCase } from '@/src/modules/todos/delete/delete-todo.use-case';
import { UnauthenticatedError } from '@/src/modules/shared/errors/auth';
import { InputParseError } from '@/src/modules/shared/errors/common';

import {
  getAuthenticationService,
  getTransactionManagerService,
  getInstrumentationService,
  getCrashReporterService,
} from '@/src/service-locator';

const inputSchema = z.object({
  dirty: z.array(z.number()),
  deleted: z.array(z.number()),
});

export async function bulkUpdateController(
  input: z.infer<typeof inputSchema>,
  sessionId: string | undefined
): Promise<void> {
  const instrumentationService = getInstrumentationService();
  const crashReporterService = getCrashReporterService();

  return instrumentationService.startSpan(
    { name: 'bulkUpdate Controller' },
    async () => {
      try {
        // Authentication
        if (!sessionId) {
          throw new UnauthenticatedError('Must be logged in to bulk update todos');
        }

        const authService = getAuthenticationService();
        const { user } = await authService.validateSession(sessionId);

        // Input validation
        const { data, error: inputParseError } = inputSchema.safeParse(input);
        if (inputParseError) {
          throw new InputParseError('Invalid data', { cause: inputParseError });
        }

        const { dirty, deleted } = data;

        // Bulk update in transaction
        const transactionService = getTransactionManagerService();
        
        await transactionService.startTransaction(async (mainTx) => {
          try {
            await Promise.all(
              dirty.map((todoId) =>
                toggleTodoUseCase({ todoId }, user.id, mainTx)
              )
            );
          } catch (err) {
            console.error('Rolling back toggles!', err);
            mainTx.rollback();
            throw err;
          }

          await transactionService.startTransaction(
            async (deleteTx) => {
              try {
                await Promise.all(
                  deleted.map((todoId) =>
                    deleteTodoUseCase({ todoId }, user.id, deleteTx)
                  )
                );
              } catch (err) {
                console.error('Rolling back deletes!', err);
                deleteTx.rollback();
                throw err;
              }
            },
            mainTx
          );
        });
      } catch (error) {
        crashReporterService.report(error);
        throw error;
      }
    }
  );
}
