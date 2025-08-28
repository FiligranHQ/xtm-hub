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

await esbuild.build({
  logLevel: 'info',
  entryPoints: ['src/es-migrations/**.js'],
  bundle: true,
  platform: 'node',
  sourcemap: 'inline',
  outdir: 'dist/src/es-migrations',
  format: 'esm',
  packages: 'external',
});
