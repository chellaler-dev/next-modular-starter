'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { signUpController } from '@/src/modules/auth/sign-up/sign-up.controller';
import { signInController } from '@/src/modules/auth/sign-in/sign-in.controller';
import { signOutController } from '@/src/modules/auth/sign-out/sign-out.controller';
import { Cookie } from '@/src/modules/shared/models/cookie';
import { SESSION_COOKIE } from '@/config';
import { InputParseError } from '@/src/modules/shared/errors/common';
import {
  AuthenticationError,
  UnauthenticatedError,
} from '@/src/modules/shared/errors/auth';

export async function signUp(formData: FormData) {
  const username = formData.get('username')?.toString();
  const password = formData.get('password')?.toString();
  const confirmPassword = formData.get('confirm_password')?.toString();

  try {
    const { cookie } = await signUpController({
      username,
      password,
      confirm_password: confirmPassword,
    });

    const cookieStore = await cookies();
    cookieStore.set(cookie.name, cookie.value, cookie.attributes);
  } catch (err) {
    if (err instanceof InputParseError) {
      return {
        error: 'Invalid data. Make sure the Password and Confirm Password match.',
      };
    }
    if (err instanceof AuthenticationError) {
      return { error: err.message };
    }
    console.error('Sign up error:', err);
    return {
      error: 'An error happened. Please try again later.',
    };
  }

  redirect('/');
}


export async function signIn(formData: FormData) {
  const username = formData.get('username')?.toString();
  const password = formData.get('password')?.toString();

  try {
    const cookie = await signInController({ username, password });
    const cookieStore = await cookies();
    cookieStore.set(cookie.name, cookie.value, cookie.attributes);
  } catch (err) {
    if (err instanceof InputParseError || err instanceof AuthenticationError) {
      return { error: 'Incorrect username or password' };
    }
    console.error('Sign in error:', err);
    return { error: 'An error happened. Please try again later.' };
  }

  redirect('/');
}

export async function signOut() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

  try {
    const blankCookie = await signOutController(sessionId);
    cookieStore.set(blankCookie.name, blankCookie.value, blankCookie.attributes);
  } catch (err) {
    if (err instanceof UnauthenticatedError || err instanceof InputParseError) {
      redirect('/sign-in');
    }

    console.error('Sign out error:', err);
    throw err;
  }

  redirect('/sign-in');
}
