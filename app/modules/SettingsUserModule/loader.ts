import { prismaAdmin } from "prisma-admin/prisma-admin";
import type { LoaderFunctionArgs } from "react-router";

export async function SettingsUserLoader({ request }: LoaderFunctionArgs) {
  const allowedUsers = await prismaAdmin.allowedUser.findMany({
    include: {
      User: true,
      UserModelPermission: true
    }
  })

  return {
    allowedUsers
  };
}
