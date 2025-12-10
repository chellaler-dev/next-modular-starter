'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

import { createTodoController } from '@/src/modules/todos/create/create-todo.controller';
import { toggleTodoController } from '@/src/modules/todos/toggle/toggle-todo.controller';
import { bulkUpdateController } from '@/src/modules/todos/toggle/bulk-update.controller';
import { SESSION_COOKIE } from '@/config';
import { UnauthenticatedError } from '@/src/modules/shared/errors/auth';
import { InputParseError, NotFoundError } from '@/src/modules/shared/errors/common';

export async function createTodo(formData: FormData) {
  try {
    const data = Object.fromEntries(formData.entries());
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

    await createTodoController(data, sessionId);

    revalidatePath('/');
    return { success: true };
  } catch (err) {
    if (err instanceof InputParseError) {
      return { error: err.message };
    }
    if (err instanceof UnauthenticatedError) {
      return { error: 'Must be logged in to create a todo' };
    }
    // Errors already reported by controller
    console.error('Create todo error:', err);
    return {
      error: 'An error happened while creating a todo. Please try again later.',
    };
  }
}

export async function toggleTodo(todoId: number) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

    await toggleTodoController({ todoId }, sessionId);

    revalidatePath('/');
    return { success: true };
  } catch (err) {
    if (err instanceof InputParseError) {
      return { error: err.message };
    }
    if (err instanceof UnauthenticatedError) {
      return { error: 'Must be logged in to toggle a todo' };
    }
    if (err instanceof NotFoundError) {
      return { error: 'Todo does not exist' };
    }
    // Errors already reported by controller
    console.error('Toggle todo error:', err);
    return {
      error: 'An error happened while toggling the todo. Please try again later.',
    };
  }
}

export async function bulkUpdate(dirty: number[], deleted: number[]) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

    await bulkUpdateController({ dirty, deleted }, sessionId);

    revalidatePath('/');
    return { success: true };
  } catch (err) {
    if (err instanceof InputParseError) {
      return { error: err.message };
    }
    if (err instanceof UnauthenticatedError) {
      return { error: 'Must be logged in to bulk update todos' };
    }
    if (err instanceof NotFoundError) {
      return { error: 'Todo does not exist' };
    }
    // Errors already reported by controller
    console.error('Bulk update error:', err);
    return {
      error: 'An error happened while bulk updating the todos. Please try again later.',
    };
  }
}