import fs from 'fs';
import path from 'path';

const GENERATED_DIR = path.resolve(__dirname, '../__generated__');
const OUTPUT_DIR = path.resolve(__dirname, '../__generated__/models');

function extractStringUnionType(
  source: string,
  typeName: string
): string[] | null {
  const typeRegex = new RegExp(`export type ${typeName}\\s*=\\s*([^;]+);`);
  const match = source.match(typeRegex);
  if (!match) {
    return null;
  }

  const typeContent = match[1];
  if (!typeContent) {
    return null;
  }
  const isStringUnion = /^(\s*['"][^'"]+['"]\s*\|\s*)*['"][^'"]+['"]\s*$/.test(
    typeContent
  );
  if (!isStringUnion) {
    return null;
  }

  const enumValues = typeContent
    .split('|')
    .map((enumValue) => enumValue.trim().replace(/^['"]|['"]$/g, ''))
    .filter(
      (enumValue) => enumValue !== '%future added value' && Boolean(enumValue)
    );

  return enumValues;
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

function processFile(fileName: string): void {
  const content = fs.readFileSync(fileName, 'utf-8');
  const typeDeclarations = content.match(/export type (\w+)\s*=\s*([^;]+);/g);

  if (typeDeclarations) {
    typeDeclarations.forEach((typeDeclaration) => {
      const [, typeName] = typeDeclaration.match(/export type (\w+)/) || [];
      if (typeName) {
        const values = extractStringUnionType(content, typeName);
        if (values) {
          const enumCode = generateEnum(`${typeName}Enum`, values) + '\n';
          const outputFileName = path.join(OUTPUT_DIR, `${typeName}.enum.ts`);
          fs.writeFileSync(outputFileName, enumCode, 'utf-8');
        }
      }
    });
  }
}

function main(): void {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
  }

  const files = fs.readdirSync(GENERATED_DIR);

  files.forEach((file) => {
    if (path.extname(file) === '.ts') {
      const filePath = path.join(GENERATED_DIR, file);
      processFile(filePath);
    }
  });
  console.warn('👌 Enum files from GraphQL updated');
}

main();
