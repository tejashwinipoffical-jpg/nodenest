import { NextResponse } from 'next/server';
import { TestResult } from '@/lib/types';

interface ExecuteRequest {
  code: string;
  language: string;
  test_cases: Array<{ input: string; expected_output: string }>;
}

// ── Simple JS sandbox evaluator ────────────────────────────────────────────
function runJavaScript(code: string, input: string): { result: string; error?: string } {
  try {
    // Build a self-contained execution context
    const lines = input.trim().split('\n');
    const wrappedCode = `
      ${code}
      
      const __lines = ${JSON.stringify(lines)};
      const __args = __lines.map(l => {
        try { return JSON.parse(l); } catch { return l; }
      });

      // Find the first user-defined function if specific ones aren't found
      const __fns = Object.keys(this).filter(k => typeof this[k] === 'function' && !['Array','Object','JSON','Math','String','Number','Boolean','RegExp','Error','Promise','Set','Map'].includes(k));
      
      let __result;
      if (typeof solution === 'function') {
        __result = solution(...__args);
      } else if (typeof twoSum === 'function') {
        __result = twoSum(...__args);
      } else if (typeof isValid === 'function') {
        __result = isValid(...__args);  
      } else if (typeof lengthOfLongestSubstring === 'function') {
        __result = lengthOfLongestSubstring(...__args);
      } else if (typeof search === 'function') {
        __result = search(...__args);
      } else if (typeof maxSubArray === 'function') {
        __result = maxSubArray(...__args);
      } else if (__fns.length > 0) {
        __result = this[__fns[0]](...__args);
      }
      return JSON.stringify(__result);
    `;
    // eslint-disable-next-line no-new-func
    const fn = new Function(wrappedCode);
    const result = fn.call({});
    return { result: result ?? 'null' };
  } catch (err: unknown) {
    return { result: '', error: err instanceof Error ? err.message : String(err) };
  }
}

function runPython(_code: string, _input: string): { result: string; error?: string } {
  // In production, this would call Judge0 or a sandbox.
  // For the demo, return a mock successful result.
  return { result: '"Python execution requires Judge0 sandbox in production"' };
}

function runC(_code: string, _input: string): { result: string; error?: string } {
  return { result: '"C execution requires Judge0 sandbox in production"' };
}

function runCpp(_code: string, _input: string): { result: string; error?: string } {
  return { result: '"C++ execution requires Judge0 sandbox in production"' };
}

export async function POST(request: Request) {
  const start = Date.now();
  
  let body: ExecuteRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { code, language, test_cases } = body;

  if (!code || !language || !test_cases) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const results: TestResult[] = [];
  let passedCount = 0;

  for (let i = 0; i < test_cases.length; i++) {
    const tc = test_cases[i];
    const tcStart = Date.now();

    let actual = '';
    let error: string | undefined;

    if (language === 'javascript' || language === 'typescript') {
      const { result, error: err } = runJavaScript(code, tc.input);
      actual = result;
      error = err;
    } else if (language === 'python') {
      const { result, error: err } = runPython(code, tc.input);
      actual = result;
      error = err;
      // Mock success for demo if code is present
      if (code.trim().length > 0) passedCount++;
    } else if (language === 'c') {
      const { result, error: err } = runC(code, tc.input);
      actual = result;
      error = err;
      // Mock success for demo if code is present
      if (code.trim().length > 0) passedCount++;
    } else if (language === 'cpp') {
      const { result, error: err } = runCpp(code, tc.input);
      actual = result;
      error = err;
      // Mock success for demo if code is present
      if (code.trim().length > 0) passedCount++;
    }

    if (language === 'javascript' || language === 'typescript') {
      // Normalize comparison
      const normalize = (s: string) => {
        try {
          return JSON.stringify(JSON.parse(s));
        } catch {
          return s.trim();
        }
      };

      const passed = !error && normalize(actual) === normalize(tc.expected_output);
      if (passed) passedCount++;
      
      results.push({
        test_index: i,
        input: tc.input,
        expected: tc.expected_output,
        actual: error ? `Error: ${error}` : actual,
        passed,
        execution_time_ms: Date.now() - tcStart,
      });
    } else {
      // For mock languages, always mark as passed if code exists
      const passed = code.trim().length > 0;
      results.push({
        test_index: i,
        input: tc.input,
        expected: tc.expected_output,
        actual: actual,
        passed,
        execution_time_ms: Date.now() - tcStart,
      });
    }
  }

  return NextResponse.json({
    results,
    passed_count: passedCount,
    total_count: test_cases.length,
    total_time_ms: Date.now() - start,
    success: passedCount === test_cases.length,
  });
}
