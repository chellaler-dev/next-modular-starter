// features/auth/sign-out/sign-out.use-case.ts
import { AuthenticationService } from '@/src/infrastructure/services/authentication.service';
import { Cookie } from '@/src/modules/shared/models/cookie';

export async function signOutUseCase(
  sessionId: string
): Promise<{ blankCookie: Cookie }> {
  const authenticationService = new AuthenticationService();
  return authenticationService.invalidateSession(sessionId);
}