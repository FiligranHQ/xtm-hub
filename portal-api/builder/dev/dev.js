import { exec } from 'child_process';
import chokidar from 'chokidar';
import * as esbuild from 'esbuild';

let ctx = await esbuild.context({
  logLevel: 'info',
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  sourcemap: 'inline',
  outdir: 'dist',
  format: 'esm',
  packages: 'external',
});

// Custom watcher
const watcher = chokidar.watch('src/**/*.{ts,graphql}', {
  ignored: ['**/*.test.ts', 'node_modules', 'dist'],
  persistent: true,
});

const rebuild = async (path) => {
  if (path.endsWith('.graphql')) {
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
  }
  await ctx.rebuild();
};

watcher.on('change', async (path) => {
  console.log(`File changed: ${path}`);
  // Rebuild only when relevant files change
  await rebuild(path);
});

// Optionally, watch for 'add' and 'unlink' events if needed
watcher.on('add', async (path) => {
  console.log(`File added: ${path}`);
  await ctx.rebuild();
  await rebuild(path);
});

watcher.on('unlink', async (path) => {
  console.log(`File removed: ${path}`);
  await ctx.rebuild();
  await rebuild(path);
});
