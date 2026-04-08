import { Anthropic } from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.Antropic_API_KEY || '',
});

export async function POST(req: Request) {
  try {
    const { code, problem, language, results } = await req.json();

    if (!code || !problem) {
      return NextResponse.json({ error: 'Missing code or problem data' }, { status: 400 });
    }

    const prompt = `
      You are an expert competitive programming judge. Analyze the following submission.
      
      PROBLEM:
      Title: ${problem.title}
      Statement: ${problem.statement}
      Difficulty: ${problem.difficulty}
      
      SUBMISSION:
      Language: ${language}
      Code:
      \`\`\`${language}
      ${code}
      \`\`\`
      
      EXECUTION RESULTS:
      ${JSON.stringify(results, null, 2)}
      
      Please provide a concise, high-impact review of the code. 
      Include:
      1. Correctness & Efficiency analysis (Time/Space complexity).
      2. Specific pedagogical advice on how to improve the logic.
      3. A "Judge's Verdict" (Short summary).
      
      Format the output in clean Markdown with professional headings. Use a "Stunning Light" tone (positive, technical, professional).
    `;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [
        { role: 'user', content: prompt }
      ],
    });

    const analysis = response.content[0].type === 'text' ? response.content[0].text : 'Analysis unavailable.';

    return NextResponse.json({ analysis });
  } catch (error: any) {
    console.error('AI Analysis Error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate AI analysis.', 
      details: error.message,
      analysis: '### System Notice\nAI Analysis is currently unavailable. Please check your Anthropic API Key.' 
    }, { status: 500 });
  }
}
