import * as esbuild from 'esbuild';

await esbuild.build({
  logLevel: 'info',
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  sourcemap: 'inline',
  outdir: 'dist',
  format: 'esm',
  packages: 'external',
});
