import { UsersRepository } from '@/src/modules/auth/users.repository';
import { AuthenticationService } from '@/src/infrastructure/services/authentication.service';
import { AuthenticationError } from '@/src/modules/shared/errors/auth';
import type { Cookie } from '@/src/modules/shared/models/cookie';
import type { Session } from '@/src/modules/shared/models/session';
import type { User } from '@/src/modules/auth/user.model';

export async function signUpUseCase(input: { username: string; password: string }): Promise<{
  session: Session;
  cookie: Cookie;
  user: Pick<User, 'id' | 'username'>;
}> {
  const usersRepository = new UsersRepository();
  const authenticationService = new AuthenticationService();

  // Check if username exists
  const existingUser = await usersRepository.getUserByUsername(input.username);
  if (existingUser) {
    throw new AuthenticationError('Username taken');
  }

  // Generate user ID and create user
  const userId = authenticationService.generateUserId();
  const newUser = await usersRepository.createUser({
    id: userId,
    username: input.username,
    password: input.password,
  });

  // Create session
  const { cookie, session } = await authenticationService.createSession(newUser);

  return {
    cookie,
    session,
    user: { id: newUser.id, username: newUser.username },
  };
}
