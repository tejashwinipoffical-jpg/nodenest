import { NextResponse } from 'next/server';
import { MOCK_PROBLEMS, getRandomProblem } from '@/lib/mock-data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const difficulty = searchParams.get('difficulty') || undefined;
  const id = searchParams.get('id');

  // Return specific problem by id
  if (id) {
    const problem = MOCK_PROBLEMS.find((p) => p.id === id);
    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }
    return NextResponse.json({ problem });
  }

  // Return a random problem from the bank
  const problem = getRandomProblem(difficulty);
  return NextResponse.json({ problem });
}

export async function POST(request: Request) {
  // Batch: return all problems (for seeding or admin)
  return NextResponse.json({ problems: MOCK_PROBLEMS });
}
