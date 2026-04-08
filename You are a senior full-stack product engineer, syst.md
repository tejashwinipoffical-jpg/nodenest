<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# You are a senior full-stack product engineer, system architect, and UI/UX designer.

Build a complete, runnable, hackathon-ready web platform called **CodeDuel Arena** — an AI-powered real-time 1v1 coding duel platform where developers compete in live coding battles.

This must be a real working MVP, not a mockup, not a static design, and not a partially finished prototype. The app should be demo-ready, visually impressive, technically believable, and function end-to-end even if some external APIs are unavailable. If an external dependency fails, implement a fallback mock service so the app still runs locally without breaking.

====================================================

1. PRODUCT VISION
====================================================

CodeDuel Arena transforms coding practice from a solo, repetitive activity into a live, competitive, AI-powered experience.

Current coding platforms are mostly:

- solo and asynchronous
- repetitive because problems are fixed and reused
- lacking instant live competition
- limited in real-time excitement and learning pressure
- weak in immediate feedback during a challenge

CodeDuel Arena solves this by introducing:

- live 1v1 coding duels
- AI-generated unique skill-matched problems
- instant judging after submission
- blind opponent progress tracking
- live leaderboard and player performance analytics
- a fun, gamified, competitive coding environment

The platform should feel like a startup product demo with an esports-style coding experience.

====================================================
2. REQUIRED TECH STACK
====================================================

Use exactly this stack unless a small integration change is required for the app to run cleanly:

Frontend:

- Next.js latest stable with App Router
- TypeScript
- Tailwind CSS
- shadcn/ui or similarly clean reusable component approach
- Monaco Editor for the coding editor

Backend / Data:

- Supabase Auth
- Supabase Postgres database
- Supabase storage only if needed
- SQL schema for all major entities

Realtime:

- Socket.IO for duel events, timer sync, progress sync, room state, and result events

AI:

- Claude API or Anthropic-compatible API for:

1. coding problem generation
2. judging explanation / code quality feedback
- IMPORTANT: correctness must not depend only on AI
- use deterministic hidden test-case validation first
- then use AI for code quality / explanation / tie-break enrichment

Architecture:

- Hybrid REST + realtime WebSocket architecture
- Clean API routes or server actions where appropriate
- Scalable folder structure
- Environment variable support
- Demo seed data

====================================================
3. NON-NEGOTIABLE OUTPUT QUALITY
====================================================

The final app must:

- run locally
- have a clean project structure
- include working pages and navigation
- include setup instructions
- include demo seed data
- include mock fallback data/services if API keys are missing
- avoid broken placeholders
- avoid dead buttons
- avoid unimplemented pages
- include loading, empty, and error states
- be responsive on desktop and mobile
- look polished enough for a hackathon final demo

Do NOT:

- return only UI screens
- leave core features as TODOs
- generate only Figma-like components
- create fake backend flows with no logic
- depend entirely on unavailable paid APIs
- overcomplicate deployment beyond a hackathon MVP

====================================================
4. CORE USER ROLES
====================================================

Implement these roles:

1. Guest
2. Authenticated Player
3. Admin / Demo Organizer

Guest can:

- view landing page
- explore features
- view public leaderboard
- try demo duel mode if enabled

Player can:

- sign up / log in
- edit profile
- join queue
- create private room
- participate in duels
- submit code
- view results
- view leaderboard
- view personal analytics and match history

Admin can:

- seed demo users
- create sample matches
- inspect match records
- trigger test problems
- reset leaderboard/demo data if needed

====================================================
5. CORE FEATURES
====================================================

Implement all of the following.

A. Landing page

- strong hero section introducing CodeDuel Arena
- concise problem statement
- how it differs from LeetCode/Codewars-like platforms
- feature highlights:
    - live 1v1 duels
    - AI-generated problems
    - instant judging
    - blind progress tracking
    - leaderboards and analytics
- CTA buttons:
    - Start Duel
    - Join Match
    - View Leaderboard
    - Try Demo
- modern premium competitive visual style
- dark mode preferred by default
- smooth microinteractions
- responsive mobile-friendly design

B. Authentication

- sign up / sign in / sign out
- email + password using Supabase Auth
- optional guest demo access
- profile creation after signup

C. Player profile
Store:

- id
- username
- email
- avatar
- rating
- wins
- losses
- draws if needed
- streak
- preferred language
- selected skill level
- bio or tagline
- created_at / updated_at

D. Dashboard
Show:

- player summary card
- rating
- win/loss stats
- current streak
- recent matches
- performance analytics
- quick action buttons:
    - Join Public Queue
    - Create Private Duel
    - Practice with AI
    - View Leaderboard

E. Matchmaking

- public 1v1 queue
- basic rating or skill-based matching
- private room creation with room code
- room join by code
- waiting lobby with both players visible
- ready state before duel begins
- match start only when both are connected or ready

F. AI problem generation
When duel starts:

- generate one unique coding problem matched to skill level
- include:
    - title
    - difficulty
    - topic/tags
    - problem statement
    - input format
    - output format
    - constraints
    - examples
    - hidden test cases
    - expected function signature if needed
    - supported languages
- if AI API is unavailable:
    - use predefined seeded problem bank with same structure
- ensure hackathon demo never breaks because AI is down

G. Duel room
This is the most important screen.

Must include:

- problem statement panel
- Monaco Editor
- language selector
- timer
- code run button
- submit button
- duel metadata (difficulty, room id, status)
- opponent card
- blind opponent progress tracking
- connection / sync status
- test result preview for local run
- final submission status

Blind progress tracking must show only safe competitive signals like:

- opponent joined
- opponent typing
- opponent running code
- opponent submitted
- completion percentage or stage indicator
- no code visibility
- no code leakage

H. Realtime system
Implement Socket.IO events for:

- queue:join
- queue:leave
- queue:matched
- room:create
- room:join
- room:ready
- duel:start
- duel:tick
- duel:progress
- code:run
- solution:submit
- judge:start
- judge:complete
- duel:end
- leaderboard:update
- presence:update

Ensure state sync works safely and consistently.

I. Code execution and judging
Implement realistic judging flow:

1. user writes code
2. user runs code locally against visible sample tests
3. user submits final solution
4. backend validates against hidden tests
5. AI evaluates code quality, explanation, and style
6. system computes total score
7. winner is declared

Judging dimensions:

- correctness
- hidden test pass rate
- completion time
- efficiency or runtime score
- code quality / readability
- tie-break logic

Winner logic priority:

1. correctness
2. hidden test pass percentage
3. time to submission
4. efficiency score
5. AI code quality score

IMPORTANT:
Do not trust AI alone for correctness.
Use deterministic test-case checks first.

J. Result screen
After duel:

- winner banner
- player vs opponent comparison
- score breakdown
- test pass summary
- efficiency summary
- code quality summary
- rating gain/loss
- rematch option
- back to dashboard
- share or copy result summary if easy to implement

K. Leaderboard
Implement:

- global leaderboard
- optional weekly leaderboard
- ranking by rating or points
- columns like:
    - rank
    - username
    - rating
    - wins
    - win rate
    - streak
    - avg solve time
- attractive table/card hybrid UI
- search/filter if possible

L. Analytics
Player analytics page should show:

- total duels
- wins / losses
- rating trend
- average solve time
- preferred language
- strongest topic
- recent improvement
- performance by difficulty
- chart/cards if feasible

M. Admin/demo panel
Build a simple admin/demo screen for hackathon use:

- seed demo users
- generate demo problems
- create mock duel sessions
- inspect submissions
- inspect results
- reset demo data
- switch between live AI mode and mock AI mode

====================================================
6. DATABASE / SCHEMA REQUIREMENTS
====================================================

Design a practical Supabase/Postgres schema with relations and indexes.

Include at minimum these tables:

- profiles
- duel_rooms
- duel_participants
- problems
- problem_test_cases
- submissions
- judging_results
- match_results
- leaderboard_entries or leaderboard_snapshots
- user_stats
- queue_entries if useful
- admin_logs if useful

Each table should have:

- primary key
- created_at
- updated_at where relevant
- proper foreign keys
- useful indexes

Also include:

- seed SQL or seed script
- sample users
- sample problems
- sample duel history

====================================================
7. PAGE / ROUTE REQUIREMENTS
====================================================

Create all major pages and make them navigable:

Public:

- /
- /leaderboard
- /login
- /signup
- /demo (optional)

Authenticated:

- /dashboard
- /profile
- /matchmaking
- /room/[roomId]
- /results/[matchId]
- /analytics

Admin:

- /admin

If you prefer route groups or app router nesting, keep it organized.

====================================================
8. UI/UX DIRECTION
====================================================

Design language:

- sleek
- futuristic
- competitive
- premium dark theme
- startup-quality polish
- coding + esports feel
- not childish
- not generic SaaS template
- not overloaded

Visual behavior:

- elegant motion
- polished cards
- strong contrast
- readable typography
- clean spacing
- responsive layout
- desktop-first duel experience but mobile-friendly outer pages

Important UX rules:

- loading states everywhere async work happens
- empty states for no matches/history
- retry states for connection issues
- graceful fallback if realtime disconnects
- disabled button states
- clear feedback on run/submit/judge actions
- toast messages or inline status where appropriate

====================================================
9. HACKATHON DEMO OPTIMIZATION
====================================================

This app is specifically for a hackathon demo, so optimize for:

- instant wow factor on landing page
- a fast path to enter a duel
- a seeded demo flow that works in under 2 minutes
- visible realtime updates
- believable AI integration
- polished final result screen
- easy narration during demo

Include demo helpers:

- preloaded users like PlayerAlpha and PlayerBeta
- pre-seeded leaderboard
- mock duel room
- sample generated problems
- AI fallback mode toggle
- no-auth demo mode if possible

====================================================
10. TECHNICAL IMPLEMENTATION DETAILS
====================================================

Use good engineering structure.

Expected folders may include:

- app/
- components/
- lib/
- hooks/
- types/
- services/
- supabase/
- socket/
- scripts/
- public/

Implement:

- reusable UI components
- typed models/interfaces
- centralized API utilities
- clear environment variable template
- clean error boundaries where relevant

If direct code execution sandboxing is too complex for a hackathon MVP, simulate code execution safely using:

- predefined evaluation logic
- language templates
- hidden test assertions
- deterministic scoring rules
- mock execution engine
But keep the duel flow believable and interactive.

If true multi-language execution is too heavy, support one primary language first (for example JavaScript or Python) and structure the app so more languages can be added later.

====================================================
11. README AND SETUP
====================================================

Include a complete README with:

- project overview
- features
- stack
- setup instructions
- environment variables
- Supabase setup steps
- how to run locally
- how mock AI fallback works
- demo account credentials
- deployment notes

Also include:

- .env.example
- SQL schema or migrations
- seed script
- sample API keys placeholders

====================================================
12. FAILURE-PROOFING
====================================================

This app must not crash if:

- Claude/AI API key is missing
- Supabase is not fully configured yet
- socket connection reconnects
- no real users are online
- leaderboard has no records
- analytics has sparse data

Therefore:

- implement mock fallback mode
- implement seeded data
- implement reconnect handling
- implement graceful empty states
- implement sample duel mode

====================================================
13. DELIVERY EXPECTATION
====================================================

Generate:

1. full project code
2. major pages
3. reusable components
4. schema and data models
5. seed/demo logic
6. README
7. setup instructions
8. environment template

Priority order:

1. complete end-to-end duel flow
2. polished landing page
3. matchmaking + duel room
4. judging + results
5. leaderboard + analytics
6. admin/demo controls

If tradeoffs are needed, prioritize a working full demo over edge-case perfection.

Final requirement:
The final product should look and behave like a real startup MVP called CodeDuel Arena that can impress hackathon judges in a live demo.
create an empty md file

Done — I created an empty Markdown file: `CodeDuel_Arena_Prompt.md` .

