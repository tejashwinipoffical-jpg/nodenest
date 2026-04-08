import { Anthropic } from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const anthropic = new Anthropic({
  apiKey: process.env.Antropic_API_KEY || '',
});

export async function POST(req: Request) {
  try {
    const { difficulty } = await req.json();

    const prompt = `
      You are a world-class competitive programming problem generator.
      
      Generate a unique and creative coding problem with the following difficulty: ${difficulty || 'Easy'}.
      
      The response MUST be a single, valid JSON object with EXACTLY these fields:
      {
        "title": "Short catchy title",
        "difficulty": "${difficulty || 'Easy'}",
        "topic": "The algorithm category (e.g. Arrays, Recursion, Dynamic Programming)",
        "statement": "Clear, professional problem description in Markdown. Include a story element.",
        "input_format": "Description of input arguments",
        "output_format": "Description of the return value",
        "constraints_text": "Time/Space constraints + edge case constraints",
        "examples": [
          { "input": "JSON string of input arguments", "output": "JSON string of expected output", "explanation": "Brief reasoning" }
        ],
        "hidden_test_cases": [
          { "input": "JSON string of input arguments", "expected_output": "JSON string of expected output" },
          { "input": "...", "expected_output": "..." }
        ]
      }

      CRITICAL RULES:
      1. Ensure the examples and test cases are logically sound.
      2. The hidden_test_cases should include at least 5-8 cases (including edge cases).
      3. Return ONLY the JSON object. No conversational text.
    `;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [
        { role: 'user', content: prompt }
      ],
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';
    
    // Extract JSON in case Claude adds markdown blocks
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('AI failed to return valid JSON');
    
    const problemData = JSON.parse(jsonMatch[0]);

    // Save to database for tracking/reuse
    const { data: savedProblem, error } = await supabase
      .from('problems')
      .insert([problemData])
      .select()
      .single();

    if (error) console.error('Error saving AI problem:', error);

    return NextResponse.json(savedProblem || problemData);
  } catch (error: any) {
    console.error('Problem Generation Error:', error);
    return NextResponse.json({ error: 'Failed to generate problem', details: error.message }, { status: 500 });
  }
}
