import fs from 'fs';
import { Kind, parse } from 'graphql';
import path from 'path';

const SCHEMA_PATH = path.resolve(__dirname, '../schema.graphql');
const OUTPUT_DIR = path.resolve(__dirname, '../__generated__/models');

function extractEnumEntries(schemaContent: string): Array<[string, string[]]> {
  const ast = parse(schemaContent);
  const orderedEnums = new Map<string, string[]>();

  ast.definitions.forEach((definition) => {
    if (definition.kind === Kind.ENUM_TYPE_DEFINITION) {
      const values = (definition.values ?? []).map(
        (enumValue) => enumValue.name.value
      );
      orderedEnums.set(definition.name.value, values);
      return;
    }

    if (definition.kind === Kind.ENUM_TYPE_EXTENSION) {
      const enumName = definition.name.value;
      const existingValues = orderedEnums.get(enumName) ?? [];
      const extensionValues = (definition.values ?? []).map(
        (enumValue) => enumValue.name.value
      );

      extensionValues.forEach((extensionValue) => {
        if (!existingValues.includes(extensionValue)) {
          existingValues.push(extensionValue);
        }
      });

      orderedEnums.set(enumName, existingValues);
    }
  });

  return Array.from(orderedEnums.entries());
}

function generateEnum(enumName: string, values: string[]): string {
  const lines = values.map((value) => {
    const key = value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '_')
      .replace(/_+/g, '_');
    return `  ${key} = "${value}",`;
  });
  return `export enum ${enumName} {\n${lines.join('\n')}\n}`;
}

function writeEnumFiles(enumEntries: Array<[string, string[]]>): void {
  enumEntries.forEach(([enumName, enumValues]) => {
    if (enumValues.length === 0) {
      return;
    }

    const enumCode = `${generateEnum(`${enumName}Enum`, enumValues)}\n`;
    const outputFileName = path.join(OUTPUT_DIR, `${enumName}.enum.ts`);
    fs.writeFileSync(outputFileName, enumCode, 'utf-8');
  });
}

function main(): void {
  if (!fs.existsSync(SCHEMA_PATH)) {
    throw new Error(`Schema file not found: ${SCHEMA_PATH}`);
  }

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const schemaContent = fs.readFileSync(SCHEMA_PATH, 'utf-8');
  const enumEntries = extractEnumEntries(schemaContent);

  writeEnumFiles(enumEntries);

  console.warn('👌 Enum files from GraphQL updated');
}

main();
