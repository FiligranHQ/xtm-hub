import fs from 'fs';
import path from 'path';

const APPS_PATH = path.join(__dirname, '..', '..');

const ERROR_CODE_FILE_PATH = path.join(
  APPS_PATH,
  'backend',
  'src',
  'utils',
  'error',
  'error.code.ts'
);

const mergeWithExistingData = (
  file: string,
  errorTranslationKeys: string[]
) => {
  try {
    const existingData = fs.readFileSync(file, 'utf8');
    const existingValues = JSON.parse(existingData);
    const updatedValues = { ...existingValues['Error']['Server'] };

    let isNewKeyAdded = false;
    for (const key of errorTranslationKeys) {
      if (!updatedValues.hasOwnProperty(key)) {
        console.log(`➕  ${key}`);
        updatedValues[key] = '';
        isNewKeyAdded = true;
      }
    }

    for (const key in updatedValues) {
      if (!errorTranslationKeys.includes(key)) {
        console.log(`🧹 ${key}`);
        delete updatedValues[key];
      }
    }

    const sortedKeys = Object.keys(updatedValues).sort((a, b) =>
      a.toLowerCase().localeCompare(b.toLowerCase())
    );
    const sortedValues: Record<string, unknown> = {};
    sortedKeys.forEach((key) => {
      sortedValues[key] = updatedValues[key];
    });

    fs.writeFileSync(
      file,
      JSON.stringify(
        {
          ...existingValues,
          Error: { ...existingValues['Error'], Server: sortedValues },
        },
        null,
        2
      )
    );
    console.log('✅  File written successfully');
    if (isNewKeyAdded) {
      console.log('\n⚠️  Please translate new keys');
    }
  } catch (error) {
    console.error(`❌ Error merging with existing data: ${error}`);
  }
};

const main = () => {
  if (!fs.existsSync(ERROR_CODE_FILE_PATH)) {
    throw new Error(`❌ Error code file not found at ${ERROR_CODE_FILE_PATH}`);
  }

  const fileContent = fs.readFileSync(ERROR_CODE_FILE_PATH, 'utf8');
  const regex = /'([^']*)'/g;
  const matches = Array.from(fileContent.matchAll(regex), (m) => m[1]);
  const errorTranslationKeys = matches.filter((m) => m).map((m) => `${m}`);
  for (const locale of ['fr', 'en']) {
    console.log(`-- PROCESS ${locale.toUpperCase()} --`);
    const file = path.join(
      APPS_PATH,
      'portal-front',
      'messages',
      locale + '.json'
    );
    mergeWithExistingData(file, errorTranslationKeys);
    console.log('-- END --');
  }
};

main();
