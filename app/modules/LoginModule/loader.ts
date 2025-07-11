import { redirect, type LoaderFunctionArgs } from 'react-router';
import { auth } from '~/lib/auth';

export async function LoginLoader({ request }: LoaderFunctionArgs) {
  const session = await auth.api.getSession(request);

  if (session?.user) {
    return redirect('/');
  }

  return null;
}
