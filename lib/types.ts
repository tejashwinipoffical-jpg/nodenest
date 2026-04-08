export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type Language = 'javascript' | 'python' | 'typescript' | 'c' | 'cpp';
export type DuelStatus = 'waiting' | 'accepting' | 'active' | 'finished' | 'forfeit';
export type SubmissionStatus = 'idle' | 'running' | 'passed' | 'failed' | 'error';

export interface Profile {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  rating: number;
  wins: number;
  losses: number;
  draws: number;
  streak: number;
  preferred_language: Language;
  bio?: string;
  created_at: string;
}

export interface TestCase {
  input: string;
  output?: string;
  expected_output?: string;
  explanation?: string;
}

export interface Problem {
  id: string;
  title: string;
  difficulty: Difficulty;
  topic: string;
  statement: string;
  input_format?: string;
  output_format?: string;
  constraints_text?: string;
  examples: TestCase[];
  hidden_test_cases: TestCase[];
  supported_languages: Language[];
  created_at: string;
}

export interface DuelRoom {
  id: string;
  room_code: string;
  status: DuelStatus;
  problem_id: string;
  problem?: Problem;
  started_at?: string;
  ended_at?: string;
  created_at: string;
}

export interface DuelParticipant {
  room_id: string;
  user_id: string;
  profile?: Profile;
  code: string;
  language: Language;
  submission_status: SubmissionStatus;
  test_results?: TestResult[];
  passed_count: number;
  total_count: number;
  last_saved_at?: string;
}

export interface TestResult {
  test_index: number;
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
  execution_time_ms?: number;
}

export interface MatchResult {
  id: string;
  room_id: string;
  winner_id?: string;
  loser_id?: string;
  winner_score?: number;
  loser_score?: number;
  win_reason?: string;
  created_at: string;
}

export interface AIFeedback {
  summary: string;
  time_complexity: string;
  space_complexity: string;
  strengths: string[];
  improvements: string[];
  optimized_approach?: string;
}

export interface OpponentProgress {
  socketId: string;
  status: 'typing' | 'running' | 'submitted' | 'idle';
  completionEstimate: number; // 0-100%
}

// Queue / Lobby types
export interface QueueState {
  inQueue: boolean;
  waitTime: number; // seconds
  activePlayers: number;
  matched?: { roomId: string; players: Profile[] };
}

export interface MatchAcceptState {
  accepted: boolean;
  declined: boolean;
  opponentAccepted: boolean;
  timeLeft: number; // seconds
}

// Dashboard
export interface RecentMatch {
  id: string;
  opponent: string;
  result: 'win' | 'loss' | 'draw';
  rating_delta: number;
  problem_title: string;
  difficulty: Difficulty;
  played_at: string;
}

export interface LeaderboardEntry {
  rank: number;
  profile: Profile;
  win_rate: number;
}
