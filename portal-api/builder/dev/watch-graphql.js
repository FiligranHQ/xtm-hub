import { exec } from 'child_process';
import chokidar from 'chokidar';

const watcher = chokidar.watch('src/**/*.graphql', {
  ignored: ['node_modules', 'dist'],
  persistent: true,
});

let timeout;
const debounceTime = 100; // Adjust debounce time as needed

const runCodegen = () => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    console.log('GraphQL file changed, running codegen...');
    exec('yarn generate:ts', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing generate:ts: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
      }
      console.log(`stdout: ${stdout}`);
    });
  }, debounceTime);
};

watcher.on('change', runCodegen);
watcher.on('add', runCodegen);
watcher.on('unlink', runCodegen);
