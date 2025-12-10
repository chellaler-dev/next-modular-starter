import { UsersRepository } from '@/src/modules/auth/users.repository';
import { AuthenticationService } from '@/src/infrastructure/services/authentication.service';
import { AuthenticationError } from '@/src/modules/shared/errors/auth';
import type { Cookie } from '@/src/modules/shared/models/cookie';
import type { Session } from '@/src/modules/shared/models/session';

export async function signInUseCase(input: {
  username: string;
  password: string;
}): Promise<{ session: Session; cookie: Cookie }> {
  const usersRepository = new UsersRepository();
  const authenticationService = new AuthenticationService();

  // Get user
  const existingUser = await usersRepository.getUserByUsername(input.username);

  if (!existingUser) {
    throw new AuthenticationError('User does not exist');
  }

  // Validate password
  const validPassword = await authenticationService.validatePasswords(
    input.password,
    existingUser.password_hash
  );

  if (!validPassword) {
    throw new AuthenticationError('Incorrect username or password');
  }

  // Create session
  return authenticationService.createSession(existingUser);
}