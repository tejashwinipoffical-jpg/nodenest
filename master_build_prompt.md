# CodeDuel Arena - Master Build Prompt

**Goal:** Build a complete, responsive web platform called CodeDuel Arena for AI-powered real-time 1v1 coding duels.

## 1. Core Architecture
- **Frontend Layer:** Next.js (App Router), deployed on Vercel. Code editing must be powered by `@monaco-editor/react`. UI should be dark-mode by default, emphasizing a modern "esports" feel using Tailwind CSS and Framer Motion for animations.
- **Backend/State Layer:** Supabase for persistent server-authoritative state (Postgres for users, duel state, problem bank) and Auth. Socket.io for transient, real-time events (matchmaking queue, opponent typing progress, instant reconnect messages). 
- **AI Service Layer:** A Hybrid API routing setup. Use low-cost models (like Gemini) via background workers to batch-generate the problem bank. Use Claude (Anthropic API) restricted *only* to post-match specific feedback and complex explanations.
- **Judging Engine:** Implement or integrate a deterministic code execution engine (like Judge0) to safely run test cases.

## 2. The Hybrid AI Strategy
Crucially, do **NOT** use a premium LLM (like Claude) to generate the question live when a match starts. Follow this pattern instead:
1. **Offline/Batch Preparation:** Create API endpoints that invoke lower-cost AI to generate dozens of coding problems (with topic, description, constraints, tags, test cases, and difficulty score) and save them to a Supabase table (`problem_bank`).
2. **Runtime Retrieval:** When two users are matched, query existing rows from the `problem_bank` that correspond to their rating division.
3. **Targeted AI Exclusively:** Only use premium conversational AI *after* the duel completes. Specifically, pass the user's submitted code and the correct answer into Anthropic's Claude API to generate an "Instructor Recap" on what they could improve regarding time complexity or clean code practices.

## 3. Real-Time State Management & Matchmaking
The platform cannot rely solely on the browser's memory. It must survive disconnects and browser refreshes.
1. **Lobby & Queue Presence:** Implement a "Ready to Duel" queue state in Supabase. A background cron or matchmaking worker queries for two unassigned users within a similar "duel rating" (+/- 100 ELO equivalent). Once found, update both user statuses to `match_found`.
2. **Acceptance Flow:** Prompt both users with a 15-second "Accept/Decline" modal. If both accept, transition them to `in_duel` and assign them a `match_id`.
3. **Active Duel State (Server-Authoritative):** The actual code state and test results should autosave to Supabase every few seconds. Use Socket.io to sync basic blind progress (e.g., "Opponent passed 2/5 test cases", but never transmit opponent's source code).
4. **Disconnection Handling:** If the WebSocket drops, the user’s Next.js client should display a "Reconnecting..." status. Because the state is preserved in Postgres, a page refresh must load the code from the database and rejoin the Socket room seamlessly using the `match_id`, without resetting the match timer. Include a 60-second grace period before declaring an automatic forfeit.

## 4. Required Pages & Flow
- **`/` (Landing Page):** High-conversion view emphasizing competitive play and AI features.
- **`/dashboard`:** User profile showing current rating, past history, and active skill badge (e.g., "Intermediate").
- **`/queue`:** Lobby screen holding the "Ready" state, showing approximate wait times based on active users.
- **`/arena/[match_id]`:** The primary duel room holding Monaco editor, synced countdown timer, problem description panel, and submission test-case breakdown.
- **`/results/[match_id]`:** Match outcome screen detailing rating delta (+15 / -12), execution times, and the generated Claude post-mortem feedback.

## 5. Execution Instructions
Please generate the Next.js frontend structure, Tailwind configuration, component architecture for the Arena setup, the specific Supabase SQL schemas for table creation (Users, Matches, Problems), and the necessary Next.js API Routes to handle matchmaking and code execution. Provide dummy seed data where appropriate to immediately test the `problem_bank` retrieval layer.
