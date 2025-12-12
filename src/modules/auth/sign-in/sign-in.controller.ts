import { z } from 'zod';

import { signInUseCase } from './sign-in.use-case';
import { InputParseError } from '@/src/modules/shared/errors/common';
import type { Cookie } from '@/src/modules/shared/models/cookie';

import {
  getInstrumentationService,
  getCrashReporterService,
} from '@/src/service-locator';

const inputSchema = z.object({
  username: z.string().min(3).max(31),
  password: z.string().min(6).max(31),
});

export async function signInController(
  input: Partial<z.infer<typeof inputSchema>>
): Promise<Cookie> {
  const instrumentationService = getInstrumentationService();
  const crashReporterService = getCrashReporterService();

  return instrumentationService.startSpan(
    {
      name: 'signIn Controller',
      op: 'controller',
      attributes: { username: input.username },
    },
    async () => {
      try {
        const { data, error: inputParseError } = inputSchema.safeParse(input);

        if (inputParseError) {
          throw new InputParseError('Invalid data', { cause: inputParseError });
        }

        const { cookie } = await signInUseCase(data);

        return cookie;
      } catch (error) {
        crashReporterService.report(error);
        throw error;
      }
    }
  );
}
