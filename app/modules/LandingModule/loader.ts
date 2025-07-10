import type { LoaderFunctionArgs } from 'react-router';
import { prisma } from 'prisma/prisma';
import type { PrismaType } from '~/types';

export async function LandingLoader({ request }: LoaderFunctionArgs) {
  // Get Prisma metadata
  const prismaMetaData = (prisma as unknown as PrismaType)._runtimeDataModel;
  const modelsCount = Object.keys(prismaMetaData.models).length;
  return { modelsCount };
}
