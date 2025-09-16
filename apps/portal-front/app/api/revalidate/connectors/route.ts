import fs from 'fs/promises';
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

const CACHE_DIR = path.join(process.cwd(), '.cache');

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (
    authHeader !== `Bearer ${process.env.REVALIDATE_CACHE_SECRET}` &&
    process.env.REVALIDATE_CACHE_SECRET !== undefined
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const version = searchParams.get('version');

  revalidateTag('connectors');
  try {
    if (version) {
      // Invalidate specific version
      const cacheFile = path.join(CACHE_DIR, `connector-${version}.json`);
      await fs.unlink(cacheFile);
      return NextResponse.json({
        message: `Cache cleared for version ${version}`,
      });
    } else {
      // Invalidate all connector caches
      const files = await fs.readdir(CACHE_DIR);
      const connectorFiles = files.filter((f) => f.startsWith('connector-'));

      await Promise.all(
        connectorFiles.map((file) => fs.unlink(path.join(CACHE_DIR, file)))
      );

      return NextResponse.json({
        message: `Cleared ${connectorFiles.length} cache files`,
      });
    }
  } catch (_) {
    return NextResponse.json(
      {
        error: 'Failed to clear cache',
      },
      { status: 500 }
    );
  }
}
