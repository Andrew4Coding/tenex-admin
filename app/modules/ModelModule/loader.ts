import { prisma } from "prisma/prisma";
import type { LoaderFunctionArgs } from "react-router";
import type { PrismaType } from "~/types";

export async function ModelLoader({ request, params }: LoaderFunctionArgs) {

  const page: number = parseInt(new URL(request.url).searchParams.get("page") || "1", 10);
  const take: number = parseInt(new URL(request.url).searchParams.get("take") || "10", 10);
  const search: string | null = new URL(request.url).searchParams.get("search") || null;

  const model = params.model;

  if (
    typeof model !== "string" ||
    !(model in prisma) ||
    typeof (prisma as any)[model]?.findMany !== "function"
  ) {
    throw new Error(`Invalid model: ${model}`);
  }

  const prismaMetaData = (prisma as unknown as PrismaType)._runtimeDataModel;
  const modelMetadata = prismaMetaData.models[model];

  const fields = modelMetadata.fields
    .filter((field) => {
      return field.kind !== "object" && field.type !== 'DateTime' && field.type !== 'Json' && field.type !== 'Decimal' && field.type !== 'BigInt' && field.type !== 'Bytes' && field.type !== 'Unsupported' && field.type !== 'Boolean';
    })
    .map((field) => {
      return field.name
    })
  
  const enums = prismaMetaData.enums;

  const cleanedField = modelMetadata.fields.filter((field) => {
    return field.kind !== 'object'
  }).map((field) => { 
    return {
      ...field,
      options: field.kind === 'enum' ? enums[field.type]?.values.map((item) => item.name) : undefined,
    }
  })

  const stringFields = cleanedField
    .filter((field) => field.kind === 'scalar' && field.type === 'String')
    .map((field) => field.name);

  const modelFindMany = await (prisma as any)[model].findMany({
    orderBy: {
      createdAt: "desc",
    },
    take,
    skip: (page - 1) * take,
    where: search
      ? {
        OR: stringFields.map((field) => ({
          [field]: {
            contains: search,
            mode: "insensitive",
          },
        })),
      }
      : undefined,
  });

  // Pagination info
  const totalCount = await (prisma as any)[model].count({
    where: search
      ? {
        OR: stringFields.map((field) => ({
          [field]: {
            contains: search,
            mode: "insensitive",
          },
        })),
      }
      : undefined,
  });
  const totalPages = Math.ceil(totalCount / take);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  let objectFields = modelMetadata.fields.filter((field) => field.kind === 'object');

  for (const field of objectFields) {
    try {
      const fieldFrom = field.relationFromFields[0];
      const fieldTo = field.relationToFields[0];
      const modeTolName = field.relationName?.split('To')[1];
  
      if (!fieldFrom || !modeTolName) continue;
      const options = await (prisma as any)[modeTolName].findMany({
        select: {
          [fieldTo]: true,
        }
      }).then((items: any[]) => {
        return items.map((item) => item[fieldTo]).slice(0, 20);
      });
  
      // Modify fieldFrom
      cleanedField.forEach((item) => {
        if (item.name === fieldFrom) {
          item.options = options;
        }
      });
    } catch (error) { 
      console.error(`Error processing field ${field.name}:`, error);
      continue;
    }
  }

  return {
    modelFindMany,
    modelMetadata,
    modelFields: cleanedField,
    pagination: {
      totalCount,
      page,
      take,
      totalPages,
      hasNextPage,
      hasPrevPage,
    },
  };
}
