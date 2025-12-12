import { hash } from 'bcrypt-ts';
import { eq } from 'drizzle-orm';
import { PASSWORD_SALT_ROUNDS } from '@/config';
import { db } from '@/src/infrastructure/database/drizzle';
import { users } from '@/src/infrastructure/database/drizzle/schema';
import type { CreateUser, User } from '@/src/modules/auth/user.model';

export class UsersRepository {
  private static instance: UsersRepository;

  private constructor() {}

  static getInstance(): UsersRepository {
    if (!UsersRepository.instance) {
      UsersRepository.instance = new UsersRepository();
    }
    return UsersRepository.instance;
  }

  async getUser(id: string): Promise<User | undefined> {
    return db.query.users.findFirst({ where: eq(users.id, id) });
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return db.query.users.findFirst({ where: eq(users.username, username) });
  }

  async createUser(input: CreateUser): Promise<User> {
    const password_hash = await hash(input.password, PASSWORD_SALT_ROUNDS);

    const newUser: User = { id: input.id, username: input.username, password_hash };
    const [created] = await db.insert(users).values(newUser).returning();

    if (!created) throw new Error('Cannot create user');

    return created;
  }
}
