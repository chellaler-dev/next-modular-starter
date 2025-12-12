import type { Cookie } from '@/src/modules/shared/models/cookie';
import type { Session } from '@/src/modules/shared/models/session';
import type { User } from '@/src/modules/auth/user.model';
import { AuthenticationError } from '@/src/modules/shared/errors/auth';

import {
  getUsersRepository,
  getAuthenticationService,
} from '@/src/service-locator';

export async function signUpUseCase(input: {
  username: string;
  password: string;
}): Promise<{
  session: Session;
  cookie: Cookie;
  user: Pick<User, 'id' | 'username'>;
}> {
  const usersRepository = getUsersRepository();
  const authenticationService = getAuthenticationService();

  const existingUser = await usersRepository.getUserByUsername(input.username);
  if (existingUser) {
    throw new AuthenticationError('Username taken');
  }

  const userId = authenticationService.generateUserId();

  const newUser = await usersRepository.createUser({
    id: userId,
    username: input.username,
    password: input.password,
  });

  const { cookie, session } = await authenticationService.createSession(newUser);

  return {
    cookie,
    session,
    user: { id: newUser.id, username: newUser.username },
  };
}
