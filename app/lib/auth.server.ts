import { betterAuth } from "better-auth";
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prismaAdmin } from "prisma-admin/prisma-admin";

export const auth = betterAuth({
  database: prismaAdapter(prismaAdmin, {
    provider: 'postgresql',
  }),
})
