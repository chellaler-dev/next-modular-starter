// app/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { getTodosForUserController } from '@/src/modules/todos/list/get-todos-for-user.controller';
import { SESSION_COOKIE } from '@/config';
import { AuthenticationError, UnauthenticatedError } from '@/src/modules/shared/errors/auth';
import { Todo } from '@/src/modules/todos/todo.model';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from './_components/ui/card';
import { Separator } from './_components/ui/separator';
import { UserMenu } from './_components/ui/user-menu';
import { CreateTodo } from './add-todo';
import { Todos } from './todos';

async function getTodos(sessionId: string | undefined) {
  try {
    return await getTodosForUserController(sessionId);
  } catch (err) {
    if (
      err instanceof UnauthenticatedError ||
      err instanceof AuthenticationError
    ) {
      redirect('/sign-in');
    }
    // Errors already reported by controller
    console.error('Get todos error:', err);
    throw err;
  }
}

export default async function Home() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

  let todos: Todo[];
  try {
    todos = await getTodos(sessionId);
  } catch (err) {
    throw err;
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="flex flex-row items-center">
        <CardTitle className="flex-1">TODOs</CardTitle>
        <UserMenu />
      </CardHeader>
      <Separator />
      <CardContent className="flex flex-col p-6 gap-4">
        <CreateTodo />
        <Todos todos={todos} />
      </CardContent>
    </Card>
  );
}