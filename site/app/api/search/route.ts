import { NextRequest, NextResponse } from 'next/server';
import { searchSections } from '@/lib/search';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? '';
  const results = searchSections(q, 10);
  return NextResponse.json(results);
}
