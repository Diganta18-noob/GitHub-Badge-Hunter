// app/api/analyze/[username]/route.ts
// Server-side API route — GITHUB_TOKEN is available here via process.env

import { NextRequest, NextResponse } from 'next/server';
import { Analyzer } from '@/lib/engines/analyzer';
import { AnalyzerError } from '@/types';

const analyzer = new Analyzer();

export async function GET(
  _request: NextRequest,
  { params }: { params: { username: string } },
) {
  const { username } = params;

  if (!username || username.trim().length === 0) {
    return NextResponse.json(
      { error: 'Username is required' },
      { status: 400 },
    );
  }

  try {
    const profile = await analyzer.analyse(username.trim());

    // Serialize Date fields to ISO strings for JSON transport
    const serialized = {
      ...profile,
      createdAt: profile.createdAt.toISOString(),
      fetchedAt: profile.fetchedAt.toISOString(),
    };

    return NextResponse.json(serialized, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      },
    });
  } catch (err) {
    if (err instanceof AnalyzerError) {
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: err.httpStatus },
      );
    }

    const message =
      err instanceof Error ? err.message : 'An unknown error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
