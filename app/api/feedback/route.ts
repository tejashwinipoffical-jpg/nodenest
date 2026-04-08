import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { AIFeedback } from '@/lib/types';

interface FeedbackRequest {
  user_code: string;
  language: string;
  problem_title: string;
  problem_statement: string;
  passed_all: boolean;
  passed_count: number;
  total_count: number;
}

// ── Mock fallback when no API key ─────────────────────────────────────────────
function getMockFeedback(req: FeedbackRequest): AIFeedback {
  const successRate = req.passed_count / req.total_count;
  return {
    summary: successRate === 1
      ? `Great work solving **${req.problem_title}**! Your solution is correct and passes all test cases.`
      : `Your solution for **${req.problem_title}** passes ${req.passed_count} of ${req.total_count} test cases. Here's how to improve.`,
    time_complexity: 'O(n) — Linear scan with hash map lookup.',
    space_complexity: 'O(n) — Hash map stores up to n entries.',
    strengths: [
      'Clean and readable variable naming',
      'Correctly handles the base case',
      'Efficient use of early return',
    ],
    improvements: [
      'Consider edge cases like empty arrays or negative numbers',
      'A hash map approach would reduce time complexity from O(n²) to O(n)',
      'Add input validation to make the solution more robust',
    ],
    optimized_approach: `// Optimal O(n) approach using a hash map:
function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) {
      return [seen.get(complement), i];
    }
    seen.set(nums[i], i);
  }
}`,
  };
}

export async function POST(request: Request) {
  let body: FeedbackRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // Use mock if no API key available
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn('[AI Feedback] No ANTHROPIC_API_KEY — using mock feedback');
    return NextResponse.json({ feedback: getMockFeedback(body) });
  }

  try {
    const client = new Anthropic({ apiKey });

    const prompt = `You are a senior software engineer and competitive programming mentor. 
A user just finished a coding duel. Analyze their submission and provide structured feedback.

**Problem:** ${body.problem_title}
**Language:** ${body.language}
**Result:** ${body.passed_count}/${body.total_count} test cases passed

**Problem Statement:**
${body.problem_statement}

**User's Code:**
\`\`\`${body.language}
${body.user_code}
\`\`\`

Respond ONLY with a valid JSON object matching this exact structure:
{
  "summary": "2-3 sentence overall assessment",
  "time_complexity": "Big-O notation with brief explanation",
  "space_complexity": "Big-O notation with brief explanation",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "optimized_approach": "optional: brief code snippet showing the optimal approach"
}`;

    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');

    const feedback: AIFeedback = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ feedback });
  } catch (err) {
    console.error('[AI Feedback] Error calling Claude:', err);
    // Graceful fallback
    return NextResponse.json({ feedback: getMockFeedback(body) });
  }
}
