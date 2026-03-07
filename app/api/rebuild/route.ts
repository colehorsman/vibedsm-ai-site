import { NextResponse } from 'next/server';
import crypto from 'node:crypto';

export async function POST(req: Request) {
  const auth = req.headers.get('authorization');
  const expected = process.env.REBUILD_TOKEN;

  if (!expected) {
    return NextResponse.json({ ok: false, error: 'REBUILD_TOKEN not configured' }, { status: 500 });
  }

  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : '';
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  // Placeholder endpoint for future AI orchestration hooks.
  // In Vercel, code deploys are triggered by git push, so this returns ack.
  return NextResponse.json({ ok: true, message: 'Rebuild request accepted. Push to main to deploy.' });
}
