import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const auth = req.headers.get('authorization');
  const expected = process.env.REBUILD_TOKEN;

  if (!expected) {
    return NextResponse.json({ ok: false, error: 'REBUILD_TOKEN not configured' }, { status: 500 });
  }

  if (auth !== `Bearer ${expected}`) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  // Placeholder endpoint for future AI orchestration hooks.
  // In Vercel, code deploys are triggered by git push, so this returns ack.
  return NextResponse.json({ ok: true, message: 'Rebuild request accepted. Push to main to deploy.' });
}
