import { prisma } from "prisma/prisma";
import type { ActionFunctionArgs } from "react-router";

export async function ModelAction({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get('intent') as string;

  if (intent === 'create') {
    const model = formData.get('model') as string;
    const data = formData.get('data') as string;

    if (!(model in prisma) || typeof (prisma as any)[model]?.create !== 'function') {
      return { success: false, error: 'Invalid model' };
    }

    if (!data) {
      return { success: false, error: 'No data provided' };
    }

    try {
      const parsedData = JSON.parse(data);
      
      // Add createdAt and updatedAt if they don't exist
      const dataWithTimestamps = {
        ...parsedData,
        updatedAt: parsedData.updatedAt || new Date(),
      };
      
      await (prisma as any)[model].create({
        data: dataWithTimestamps,
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to create item' };
    }
  }

  if (intent === 'delete-single') {
    const model = formData.get('model') as string;
    const id = formData.get('id') as string;

    if (!(model in prisma) || typeof (prisma as any)[model]?.delete !== 'function') {
      return { success: false, error: 'Invalid model' };
    }

    try {
      await (prisma as any)[model].delete({
        where: { id },
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to delete item' };
    }
  }

  if (intent === 'delete-bulk') {
    const model = formData.get('model') as string;
    const ids = formData.getAll('ids') as string[];

    if (!(model in prisma) || typeof (prisma as any)[model]?.deleteMany !== 'function') {
      return { success: false, error: 'Invalid model' };
    }

    if (!ids || ids.length === 0) {
      return { success: false, error: 'No IDs provided' };
    }

    try {
      await (prisma as any)[model].deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return { success: true, deletedCount: ids.length };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to delete items' };
    }
  }

  return { success: false, error: 'Invalid intent' };
}
