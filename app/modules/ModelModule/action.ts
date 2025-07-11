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

  if (intent === 'update') {
    const model = formData.get('model') as string;
    const id = formData.get('id') as string;
    const data = formData.get('data') as string;

    if (!(model in prisma) || typeof (prisma as any)[model]?.update !== 'function') {
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
      return { success: false, error: error.message || 'Failed to update item' };
    }
  }

  if (intent === 'export-csv') {
    const model = formData.get('model') as string;
    const search = formData.get('search') as string | null;

    if (!(model in prisma) || typeof (prisma as any)[model]?.findMany !== 'function') {
      return { success: false, error: 'Invalid model' };
    }

    try {
      // Get searchable string fields
      const prismaMetaData = (prisma as any)._runtimeDataModel;
      const modelMetadata = prismaMetaData.models[model];
      const stringFields = modelMetadata.fields
        .filter((field: any) => field.kind === 'scalar' && field.type === 'String')
        .map((field: any) => field.name);
      const where = search
        ? {
            OR: stringFields.map((field: string) => ({
              [field]: {
                contains: search,
                mode: 'insensitive',
              },
            })),
          }
        : undefined;
      const rows = await (prisma as any)[model].findMany({ where });
      return { success: true, rows };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to export data' };
    }
  }

  return { success: false, error: 'Invalid intent' };
}
