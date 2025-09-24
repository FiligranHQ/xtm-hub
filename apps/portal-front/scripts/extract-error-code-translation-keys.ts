import fs from 'fs';
import path from 'path';

const APPS_PATH = path.join(__dirname, '..', '..');

const ERROR_CODE_FILE_PATH = path.join(
  APPS_PATH,
  'portal-api',
  'src',
  'utils',
  'error',
  'error.code.ts'
);

const ENGLISH_TRANSLATION_FILE = path.join(
  APPS_PATH,
  'portal-front',
  'messages',
  'en.json'
);

const mergeWithExistingData = (errorTranslationKeys: string[]) => {
  try {
    const existingData = fs.readFileSync(ENGLISH_TRANSLATION_FILE, 'utf8');
    const existingValues = JSON.parse(existingData);
    const updatedValues = { ...existingValues['Error']['Server'] };

    console.log('-- Add Frontend new keys --\n');
    let isNewKeyAdded = false;
    for (const key of errorTranslationKeys) {
      if (!updatedValues.hasOwnProperty(key)) {
        console.log(`➕  ${key}`);
        updatedValues[key] = '';
        isNewKeyAdded = true;
      }
    }

    console.log('\n-- Remove Frontend useless keys --\n');
    for (const key in updatedValues) {
      if (!errorTranslationKeys.includes(key)) {
        console.log(`🧹 ${key}`);
        delete updatedValues[key];
      }
    }

    console.log('\n-- End --\n');

    const sortedKeys = Object.keys(updatedValues).sort((a, b) =>
      a.toLowerCase().localeCompare(b.toLowerCase())
    );
    const sortedValues: Record<string, unknown> = {};
    sortedKeys.forEach((key) => {
      sortedValues[key] = updatedValues[key];
    });

    fs.writeFileSync(
      ENGLISH_TRANSLATION_FILE,
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
  mergeWithExistingData(errorTranslationKeys);
};

main();
