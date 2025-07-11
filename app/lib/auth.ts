import { betterAuth } from "better-auth";
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { customSession } from 'better-auth/plugins';
import { PrismaClient } from "../../prisma-admin/generated/client";

const prismaAdmin = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prismaAdmin, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
  },
  additionalFields: {
    isRootAdmin: {
      type: 'boolean',
      default: false,
      description: 'Indicates if the user is a root admin',
    },
  },
  plugins: [
    customSession(async ({ user, session }) => {
      const userModel = await prismaAdmin.user.findUnique({
        where: {
          id: user.id,
        },
        select: {
          isRootAdmin: true,
        }
      })

      const isRootAdmin = userModel?.isRootAdmin || false;

      return {
        user: {
          ...user,
          isRootAdmin,
        },
        session
      }
    })
  ]
})
