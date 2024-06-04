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
await ctx.watch();
