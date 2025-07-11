import { prisma } from 'prisma/prisma';
import { redirect, type LoaderFunctionArgs } from 'react-router';
import type { PrismaType } from '~/types';

export async function ModelDetailLoader({
  request,
  params,
}: LoaderFunctionArgs) {
  const { model, id } = params;

  if (!model || !id) {
    throw new Error('Model and ID are required');
  }

  if (
    !(model in prisma) ||
    typeof (prisma as any)[model]?.findUnique !== 'function'
  ) {
    throw new Error(`Invalid model: ${model}`);
  }

  const item = await (prisma as any)[model].findUnique({
    where: { id },
  });

  if (!item) {
    return redirect(`/${model}`);
  }

  // Get model metadata for field definitions
  const prismaMetaData = (prisma as unknown as PrismaType)._runtimeDataModel;
  const modelMetadata = prismaMetaData.models[model];
  const enums = prismaMetaData.enums;

  const modelFields = modelMetadata.fields
    .filter((field) => {
      return field.kind !== 'object';
    })
    .map((field) => {
      return {
        ...field,
        options:
          field.kind === 'enum'
            ? enums[field.type]?.values.map((item) => item.name)
            : undefined,
      };
    });

  const objectFields = modelMetadata.fields.filter(
    (field) => field.kind === 'object'
  );

  // Find related models
  const relatedModels = Object.keys(prismaMetaData.models).filter((m) => {
    return prismaMetaData.models[m].fields.some(
      (f) => f.type === model && f.kind === 'object'
    );
  });

  const finalRelatedModels = [];

  for (const field of objectFields) {
    const relatedModelName = field.type;
    if (relatedModels.includes(relatedModelName)) {
      finalRelatedModels.push({
        name: relatedModelName,
        fields: field.relationToFields,
        id: item[field.relationFromFields[0]],
      });
    }
  }

  return {
    item,
    modelName: model,
    modelFields,
    relatedModels: finalRelatedModels,
  };
}
