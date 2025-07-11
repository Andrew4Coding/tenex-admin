import type { ZodTypeAny } from 'zod';
import { z } from 'zod';
import type { prismaModelField } from '~/types';

const typeMap: Record<string, () => ZodTypeAny> = {
  String: () => z.string(),
  Int: () => z.number().int(),
  Float: () => z.number(),
  Boolean: () => z.boolean(),
  DateTime: () =>
    z
      .string()
      .refine(
        (val) =>
          /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(val) || !isNaN(Date.parse(val)),
        {
          message: 'Invalid datetime format',
        }
      ),
  BigInt: () => z.string(), // BigInt as string
  Decimal: () => z.string(), // Decimal as string
  Json: () => z.any(),
  Bytes: () => z.string(), // Bytes as base64 string
  Enum: () => z.string(), // Could be z.enum([...]) if enum values are available
  Unsupported: () => z.any(),
};

function fieldToZod(field: prismaModelField): ZodTypeAny {
  if (
    field.kind === 'enum' &&
    Array.isArray(field.options) &&
    field.options.length > 0
  ) {
    return z.enum([...field.options]);
  }
  // Special handling for required string lists
  if (field.isList && field.type === 'String') {
    let arr = z.string().array();
    if (field.isRequired) {
      arr = arr.nonempty({ message: 'At least one value is required' });
    }
    return arr;
  }
  let zodType = (typeMap[field.type] || typeMap.Unsupported)();
  if (field.isList) {
    zodType = zodType.array();
  }
  if (!field.isRequired) {
    zodType = zodType.optional();
  }
  return zodType;
}

export async function generateSchema(fields: prismaModelField[]) {
  const shape: Record<string, ZodTypeAny> = {};
  for (const field of fields) {
    shape[field.name] = fieldToZod(field);
  }
  return z.object(shape);
}
