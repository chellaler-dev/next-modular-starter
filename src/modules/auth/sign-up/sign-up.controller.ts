import { z } from 'zod';

import { signUpUseCase } from './sign-up.use-case';
import { InstrumentationService } from '@/src/infrastructure/services/instrumentation.service';
import { CrashReporterService } from '@/src/infrastructure/services/crash-reporter.service';
import { InputParseError } from '@/src/modules/shared/errors/common';
import type { Cookie } from '@/src/modules/shared/models/cookie';
import type { User } from '@/src/modules//auth/user.model';

const inputSchema = z
  .object({
    username: z.string().min(3).max(31),
    password: z.string().min(6).max(31),
    confirm_password: z.string().min(6).max(31),
  })
  .superRefine(({ password, confirm_password }, ctx) => {
    if (confirm_password !== password) {
      ctx.addIssue({
        code: 'custom',
        message: 'The passwords did not match',
        path: ['password'],
      });
      ctx.addIssue({
        code: 'custom',
        message: 'The passwords did not match',
        path: ['confirm_password'],
      });
    }
  });

export async function signUpController(
  input: Partial<z.infer<typeof inputSchema>>
): Promise<{ session: any; cookie: Cookie; user: Pick<User, 'id' | 'username'> }> {
  const instrumentationService = new InstrumentationService();
  const crashReporterService = new CrashReporterService();

  return instrumentationService.startSpan(
    { name: 'signUp Controller', op: 'controller', attributes: { username: input.username } },
    async () => {
      try {
        // Validate input
        const { data, error: inputParseError } = inputSchema.safeParse(input);

        if (inputParseError) {
          throw new InputParseError('Invalid data', { cause: inputParseError });
        }

        // Execute use case
        return await signUpUseCase(data);
      } catch (error) {
        crashReporterService.report(error);
        throw error;
      }
    }
  );
}
