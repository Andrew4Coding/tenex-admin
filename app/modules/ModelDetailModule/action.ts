import { prisma } from 'prisma/prisma';
import type { ActionFunctionArgs } from 'react-router';

export async function ModelDetailAction({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  if (request.method === 'DELETE') {
    const model = formData.get('model') as string;

    if (
      !(model in prisma) ||
      typeof (prisma as any)[model]?.delete !== 'function'
    ) {
      return { success: false, error: 'Invalid model' };
    }

    const id = formData.get('id') as string;
    const idField = formData.get('idField') as string;

    await (prisma as any)[model].delete({
      where: {
        [idField]: id,
      },
    });

    return { success: true };
  }

  // Copy of update logic from ModelModule/action.ts
  const intent = formData.get('intent') as string;
  if (intent === 'update') {
    const model = formData.get('model') as string;
    const id = formData.get('id') as string;
    const data = formData.get('data') as string;

    if (
      !(model in prisma) ||
      typeof (prisma as any)[model]?.update !== 'function'
    ) {
      return { success: false, error: 'Invalid model' };
    }

    if (!data) {
      return { success: false, error: 'No data provided' };
    }

    try {
      const parsedData = JSON.parse(data);
      // Always update updatedAt
      const dataWithTimestamps = {
        ...parsedData,
        updatedAt: new Date(),
      };
      await (prisma as any)[model].update({
        where: { id },
        data: dataWithTimestamps,
      });
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to update item',
      };
    }
  }

  return { success: false, error: 'Unsupported action' };
}
