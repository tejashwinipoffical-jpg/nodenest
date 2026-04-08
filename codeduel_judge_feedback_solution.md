# CodeDuel Arena: AI Judge Feedback & Solution Delivery System

## Overview
This document outlines the architecture and implementation strategy for the **AI Judge Feedback & Solution Delivery** mechanism in the CodeDuel Arena. The system leverages Anthropic (Claude) to analyze player code, provide real-time judging during duels, and offer comprehensive feedback and optimal solutions post-match.

## Core Objectives
1. **Fast Evaluation**: Quickly judge whether a submitted solution solves the problem using test cases.
2. **Actionable Feedback**: Provide developers with constructive hints and specific error explanations without giving away the exact solution during a duel.
3. **Post-Duel Mastery**: Supply a high-quality "master solution" with line-by-line explanations once a duel concludes.
4. **Security & Sandboxing**: Ensure player code is executed safely before being passed to the AI for semantic analysis.

## Architecture & Data Flow

### 1. Code Execution (Sandbox)
Before AI evaluation, code MUST be run in a secure sandbox environment (e.g., Docker container or via an API like Judge0).
* **Input**: Player code, problem test cases.
* **Output**: Execution result, exact output, stdout/stderr, execution time, and memory usage.

### 2. The AI Judge Layer (Anthropic Claude)
If code fails the sandbox tests, or if the user explicitly requests a "Hint", the code is sent to the AI service layer.

**System Prompt Strategy (Claude):**
> "You are the CodeDuel Master Judge. A player has submitted code that failed the test cases. Provide a strictly non-revealing hint. Point out logical flaws or edge cases they missed. DO NOT write code for them. Keep your feedback under 3 sentences."

### 3. Feedback Workflow (During Duel)
* **Trigger**: Player submits code -> Sandbox runs test cases.
* **Result**: Fails visible/hidden test cases.
* **AI Action**: Generates a hyper-specific, pedagogical hint based on the `stderr` and the exact test case failed.
* **Delivery**: Emitted via `Socket.io` to the client in real-time.

### 4. Solution Workflow (Post-Duel)
When the duel ends (timer runs out or someone wins), both players receive access to a comprehensive "Solution & Analysis" dashboard.
* **Trigger**: Match state changes to `FINISHED`.
* **AI Action**: 
    1. Generates an optimal time/space complexity solution in the language the player chose.
    2. Compares the player's final code with the optimal solution.
    3. Generates a personalized "Growth Report" highlighting what they did well and what they missed.

## Implementation Steps (Next.js, Supabase, Socket.io)

### Phase 1: Database Schema (Supabase)
```sql
-- Store AI evaluations & hints for post-match review
CREATE TABLE evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id),
  player_id UUID REFERENCES auth.users(id),
  code_snippet TEXT NOT NULL,
  ai_feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Phase 2: AI Service Integration (Server-side)
Create an Anthropic client wrapper that handles two distinct prompt types:
1. `generate_hint(problem_desc, player_code, error_output)` - Fast, concise.
2. `generate_post_match_solution(problem_desc, player_code)` - Deep analytical feedback.

### Phase 3: Real-Time Communication (Socket.io)
Emit the judge's verdict instantly to keep the duel fast-paced:
```javascript
// Server to Client (Node.js/Socket.io)
io.to(matchId).emit('judge_evaluation', {
  playerId: user.id,
  status: 'FAILED',
  hint: aiGeneratedHint,      // From Anthropic
  executionTime: '45ms'       // From Sandbox
});
```

## Security Considerations
* **Prompt Injection**: Always sanitize player code inputs before passing them into the LLM prompt. Use `<player_code>` XML tags to strictly isolate the payload from the instructions.
* **Rate Limiting**: Limit the number of AI evaluation/hint requests per minute per player to prevent API abuse and control Anthropic billing costs.
