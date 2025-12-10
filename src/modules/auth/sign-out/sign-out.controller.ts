import { signOutUseCase } from './sign-out.use-case';
import { AuthenticationService } from '@/src/infrastructure/services/authentication.service';
import { InstrumentationService } from '@/src/infrastructure/services/instrumentation.service';
import { CrashReporterService } from '@/src/infrastructure/services/crash-reporter.service';
import { InputParseError } from '@/src/modules/shared/errors/common';
import { Cookie } from '@/src/modules/shared/models/cookie';

export async function signOutController(
  sessionId: string | undefined
): Promise<Cookie> {
  const instrumentationService = new InstrumentationService();
  const crashReporterService = new CrashReporterService();

  return instrumentationService.startSpan(
    { name: 'signOut Controller' },
    async () => {
      try {
        // Validate session ID provided
        if (!sessionId) {
          throw new InputParseError('Must provide a session ID');
        }

        // Validate session exists
        const authService = new AuthenticationService();
        const { session } = await authService.validateSession(sessionId);

        // Sign out
        const { blankCookie } = await signOutUseCase(session.id);

        return blankCookie;
      } catch (error) {
        crashReporterService.report(error);
        throw error;
      }
    }
  );
}
