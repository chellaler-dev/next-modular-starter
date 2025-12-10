import { eq } from 'drizzle-orm';

import { db, type Transaction } from '@/src/infrastructure/database/drizzle';
import { todos } from '@/src/infrastructure/database/drizzle/schema';
import type { Todo, TodoInsert } from '@/src/modules/todos/todo.model';

export class TodosRepository {
  async createTodo(input: TodoInsert, tx?: Transaction): Promise<Todo> {
    const invoker = tx ?? db;

    const [created] = await invoker
      .insert(todos)
      .values(input)
      .returning();

    if (!created) {
      throw new Error('Cannot create todo');
    }

    return created;
  }

  async getTodo(id: number): Promise<Todo | undefined> {
    return db.query.todos.findFirst({
      where: eq(todos.id, id),
    });
  }

  async getTodosForUser(userId: string): Promise<Todo[]> {
    return db.query.todos.findMany({
      where: eq(todos.userId, userId),
    });
  }

  async updateTodo(
    id: number,
    input: Partial<TodoInsert>,
    tx?: Transaction
  ): Promise<Todo> {
    const invoker = tx ?? db;

    const [updated] = await invoker
      .update(todos)
      .set(input)
      .where(eq(todos.id, id))
      .returning();

    if (!updated) {
      throw new Error('Cannot update todo');
    }

    return updated;
  }

  async deleteTodo(id: number, tx?: Transaction): Promise<void> {
    const invoker = tx ?? db;

    await invoker
      .delete(todos)
      .where(eq(todos.id, id))
      .returning();
  }
}
