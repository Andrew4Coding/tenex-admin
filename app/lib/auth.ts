import { betterAuth } from "better-auth";
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from "../../prisma-admin/generated/client";

const prismaAdmin = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prismaAdmin, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
  },
})
