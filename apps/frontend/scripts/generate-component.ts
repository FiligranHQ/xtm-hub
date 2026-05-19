import { access, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import readline from 'node:readline/promises';

const toPascalCase = (value: string) => {
  const normalized = value
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => {
      const lower = part.toLowerCase();
      return `${lower.charAt(0).toUpperCase()}${lower.slice(1)}`;
    })
    .join('');

  if (!normalized) {
    throw new Error('Le nom du composant est invalide.');
  }

  return normalized;
};

const fileExists = async (filePath: string) => {
  try {
    await access(filePath);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return false;
    }
    throw error;
  }
};

const componentTemplate = (
  componentName: string
) => `interface ${componentName}Props {
  test: number;
}

export const ${componentName} = ({ test }: ${componentName}Props) => {
  return (
    <div>
      {test}
    </div>
  );
};
`;

const createComponentFile = async () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const input = await rl.question('Nom du composant: ');
    const componentName = toPascalCase(input.trim());
    const targetDirectory = process.env.INIT_CWD ?? process.cwd();
    const componentFilePath = path.resolve(
      targetDirectory,
      `${componentName}.tsx`
    );

    if (await fileExists(componentFilePath)) {
      throw new Error(`Le fichier existe deja: ${componentFilePath}`);
    }

    await writeFile(
      componentFilePath,
      componentTemplate(componentName),
      'utf-8'
    );

    process.stdout.write(`Composant cree: ${componentFilePath}\n`);
  } finally {
    rl.close();
  }
};

createComponentFile().catch((error: unknown) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${errorMessage}\n`);
  process.exitCode = 1;
});
