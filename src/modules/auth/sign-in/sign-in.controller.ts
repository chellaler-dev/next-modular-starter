import { z } from 'zod';

import { signInUseCase } from './sign-in.use-case';
import { InstrumentationService } from '@/src/infrastructure/services/instrumentation.service';
import { CrashReporterService } from '@/src/infrastructure/services/crash-reporter.service';
import { InputParseError } from '@/src/modules/shared/errors/common';
import type { Cookie } from '@/src/modules/shared/models/cookie';

const inputSchema = z.object({
  username: z.string().min(3).max(31),
  password: z.string().min(6).max(31),
});

export async function signInController(
  input: Partial<z.infer<typeof inputSchema>>
): Promise<Cookie> {
  const instrumentationService = new InstrumentationService();
  const crashReporterService = new CrashReporterService();

  return instrumentationService.startSpan(
    {
      name: 'signIn Controller',
      op: 'controller',
      attributes: { username: input.username },
    },
    async () => {
      try {
        // Validate input
        const { data, error: inputParseError } = inputSchema.safeParse(input);

        if (inputParseError) {
          throw new InputParseError('Invalid data', { cause: inputParseError });
        }

        // Execute use case (wrapped in instrumentation)
        const { cookie } = await signInUseCase(data);

        return cookie;
      } catch (error) {
        // Report errors once at the top level
        crashReporterService.report(error);
        throw error; // Re-throw for Next.js action to handle
      }
    }
  );
}