// features/todos/bulk-update.controller.ts
import { z } from 'zod';

import { toggleTodoUseCase } from '@/src/modules/todos/toggle/toggle-todo.use-case';
import { deleteTodoUseCase } from '@/src/modules/todos/delete/delete-todo.use-case';
import { AuthenticationService } from '@/src/infrastructure/services/authentication.service';
import { TransactionManagerService } from '@/src/infrastructure/services/transaction-manager.service';
import { InstrumentationService } from '@/src/infrastructure/services/instrumentation.service';
import { CrashReporterService } from '@/src/infrastructure/services/crash-reporter.service';
import { UnauthenticatedError } from '@/src/modules/shared/errors/auth';
import { InputParseError } from '@/src/modules/shared/errors/common';

const inputSchema = z.object({
  dirty: z.array(z.number()),
  deleted: z.array(z.number()),
});

export async function bulkUpdateController(
  input: z.infer<typeof inputSchema>,
  sessionId: string | undefined
): Promise<void> {
  const instrumentationService = new InstrumentationService();
  const crashReporterService = new CrashReporterService();

  return instrumentationService.startSpan(
    { name: 'bulkUpdate Controller' },
    async () => {
      try {
        // Authentication
        if (!sessionId) {
          throw new UnauthenticatedError('Must be logged in to bulk update todos');
        }

        const authService = new AuthenticationService();
        const { user } = await authService.validateSession(sessionId);

        // Input validation
        const { data, error: inputParseError } = inputSchema.safeParse(input);
        if (inputParseError) {
          throw new InputParseError('Invalid data', { cause: inputParseError });
        }

        const { dirty, deleted } = data;

        // Bulk update in transaction
        const transactionService = new TransactionManagerService();
        
        await transactionService.startTransaction(async (mainTx) => {
          try {
            // Toggle todos
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

          // Create a savepoint to avoid rolling back toggles if deletes fail
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