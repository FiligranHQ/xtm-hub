import * as esbuild from 'esbuild';
import chokidar from 'chokidar';

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
const watcher = chokidar.watch('src/**/*.ts', {
  ignored: ['**/*.test.ts', 'node_modules', 'dist'],
  persistent: true,
});

watcher.on('change', async (path) => {
  console.log(`File changed: ${path}`);
  await ctx.rebuild(); // Rebuild only when relevant files change
});

// Optionally, watch for 'add' and 'unlink' events if needed
watcher.on('add', async (path) => {
  console.log(`File added: ${path}`);
  await ctx.rebuild();
});

watcher.on('unlink', async (path) => {
  console.log(`File removed: ${path}`);
  await ctx.rebuild();
});
