export type prismaEnumData = {
  values: {
    name: string;
    dbName?: string;
  }[];
  dbName?: string;
};

export type prismaModelField = {
  name: string;
  kind: 'object' | 'scalar' | 'enum' | 'unsupported';
  options?: string[];
  isList: boolean;
  isRequired: boolean;
  isUnique: boolean;
  isId: boolean;
  isReadOnly: boolean;
  hasDefaultValue: boolean;
  type:
    | 'DateTime'
    | 'String'
    | 'Boolean'
    | 'Int'
    | 'Float'
    | 'BigInt'
    | 'Decimal'
    | 'Json'
    | 'Bytes'
    | 'Enum'
    | 'Unsupported';
  nativeType: string | null;
  relationName?: string;
  relationFromFields: string[];
  relationToFields: string[];
  isGenerated: boolean;
  isUpdatedAt: boolean;
};

export type prismaModelData = {
  dbName?: string;
  schema?: string;
  primaryKey?: string;
  uniqueFields?: string[];
  uniqueIndexes?: string[];
  fields: prismaModelField[];
};

export type PrismaMetadata = {
  models: Record<string, prismaModelData>;
  enums: Record<string, prismaEnumData>;
};

export type PrismaType = {
  _runtimeDataModel: PrismaMetadata;
};
