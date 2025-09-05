import { revalidateTag } from 'next/cache';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tag: string }> }
) {
  const { tag } = await params; // Await params first, then destructure tag

  try {
    revalidateTag(tag);
    return Response.json({
      revalidated: true,
      tag,
      now: Date.now(),
    });
  } catch (err) {
    return Response.json(
      {
        message: 'Error revalidating',
        tag,
        error: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
