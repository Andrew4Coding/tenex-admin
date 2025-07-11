import { prismaAdmin } from 'prisma-admin/prisma-admin';
import { redirect, type LoaderFunctionArgs } from 'react-router';
import { auth } from '~/lib/auth';

export async function RegisterLoader({ request }: LoaderFunctionArgs) {
  const session = await auth.api.getSession(request);

  if (session?.user) {
    return redirect('/');
  }

  // Check if theres user in the db
  let isSuperAdminRegistration = false;
  const users = await prismaAdmin.user.findMany();

  if (users.length === 0) {
    isSuperAdminRegistration = true;
  }

  return {
    isSuperAdminRegistration,
  };
}
