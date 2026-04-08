import { Problem, Profile, RecentMatch, LeaderboardEntry } from './types';

// ─── Mock Problem Bank ────────────────────────────────────────────────────────
export const MOCK_PROBLEMS: Problem[] = [
  {
    id: 'prob-001',
    title: 'Two Sum',
    difficulty: 'Easy',
    topic: 'Arrays & Hash Maps',
    statement: `Given an array of integers \`nums\` and an integer \`target\`, return the **indices** of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    input_format: 'An array of integers `nums` and an integer `target`.',
    output_format: 'An array of two integers representing the indices.',
    constraints_text: `- 2 ≤ nums.length ≤ 10⁴  
- -10⁹ ≤ nums[i] ≤ 10⁹  
- -10⁹ ≤ target ≤ 10⁹  
- Only one valid answer exists.`,
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]',
        explanation: 'nums[1] + nums[2] == 6.',
      },
    ],
    hidden_test_cases: [
      { input: '[3,3]\n6', expected_output: '[0,1]' },
      { input: '[1,2,3,4,5]\n9', expected_output: '[3,4]' },
      { input: '[-1,-2,-3,-4]\n-6', expected_output: '[1,3]' },
    ],
    supported_languages: ['javascript', 'python', 'typescript', 'c', 'cpp'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'prob-002',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    topic: 'Stack',
    statement: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is **valid**.

An input string is valid if:
- Open brackets must be closed by the same type of brackets.
- Open brackets must be closed in the correct order.
- Every close bracket has a corresponding open bracket of the same type.`,
    input_format: 'A string `s` consisting of bracket characters.',
    output_format: '`true` if valid, `false` otherwise.',
    constraints_text: '1 ≤ s.length ≤ 10⁴\n`s` consists of parentheses only.',
    examples: [
      { input: 's = "()"', output: 'true' },
      { input: 's = "()[]{}"', output: 'true' },
      { input: 's = "(]"', output: 'false' },
    ],
    hidden_test_cases: [
      { input: '"([)]"', expected_output: 'false' },
      { input: '"{[]}"', expected_output: 'true' },
      { input: '""', expected_output: 'true' },
    ],
    supported_languages: ['javascript', 'python', 'typescript', 'c', 'cpp'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'prob-003',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    topic: 'Sliding Window',
    statement: `Given a string \`s\`, find the length of the **longest substring** without repeating characters.`,
    input_format: 'A string `s`.',
    output_format: 'An integer representing the longest substring length.',
    constraints_text: '0 ≤ s.length ≤ 5 × 10⁴\n`s` consists of English letters, digits, symbols and spaces.',
    examples: [
      { input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc", with length 3.' },
      { input: 's = "bbbbb"', output: '1', explanation: 'The answer is "b", with length 1.' },
    ],
    hidden_test_cases: [
      { input: '"pwwkew"', expected_output: '3' },
      { input: '""', expected_output: '0' },
      { input: '" "', expected_output: '1' },
    ],
    supported_languages: ['javascript', 'python', 'typescript', 'c', 'cpp'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'prob-004',
    title: 'Binary Search',
    difficulty: 'Easy',
    topic: 'Binary Search',
    statement: `Given an array of integers \`nums\` which is sorted in ascending order, and an integer \`target\`, write a function to search \`target\` in \`nums\`. If \`target\` exists, then return its index. Otherwise, return \`-1\`.

You must write an algorithm with **O(log n)** runtime complexity.`,
    input_format: 'A sorted array `nums` and an integer `target`.',
    output_format: 'The index of `target` in `nums`, or `-1`.',
    constraints_text: '1 ≤ nums.length ≤ 10⁴\nAll integers in `nums` are unique.\n`nums` is sorted in ascending order.',
    examples: [
      { input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4', explanation: '9 exists in nums at index 4.' },
      { input: 'nums = [-1,0,3,5,9,12], target = 2', output: '-1', explanation: '2 does not exist in nums.' },
    ],
    hidden_test_cases: [
      { input: '[5]\n5', expected_output: '0' },
      { input: '[1,2,3,4,5]\n1', expected_output: '0' },
      { input: '[1,2,3,4,5]\n6', expected_output: '-1' },
    ],
    supported_languages: ['javascript', 'python', 'typescript', 'c', 'cpp'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'prob-005',
    title: 'Maximum Subarray',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    statement: `Given an integer array \`nums\`, find the **subarray** with the largest sum, and return its sum.

A **subarray** is a contiguous non-empty sequence of elements within an array.`,
    input_format: 'An integer array `nums`.',
    output_format: 'The maximum subarray sum.',
    constraints_text: '1 ≤ nums.length ≤ 10⁵\n-10⁴ ≤ nums[i] ≤ 10⁴',
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'Subarray [4,-1,2,1] has largest sum 6.' },
      { input: 'nums = [1]', output: '1' },
    ],
    hidden_test_cases: [
      { input: '[5,4,-1,7,8]', expected_output: '23' },
      { input: '[-1]', expected_output: '-1' },
      { input: '[-2,-1]', expected_output: '-1' },
    ],
    supported_languages: ['javascript', 'python', 'typescript', 'c', 'cpp'],
    created_at: new Date().toISOString(),
  },

];

// ─── Mock Profiles ────────────────────────────────────────────────────────────
export const MOCK_PROFILES: Profile[] = [
  {
    id: 'user-001',
    username: 'NeuralStrike',
    email: 'neural@codeduel.io',
    avatar: 'NS',
    rating: 1847,
    wins: 142,
    losses: 38,
    draws: 5,
    streak: 7,
    preferred_language: 'javascript',
    bio: 'Competitive programmer. Former ICPC regional finalist.',
    created_at: '2025-01-10T00:00:00Z',
  },
  {
    id: 'user-002',
    username: 'ByteWitch',
    email: 'witch@codeduel.io',
    avatar: 'BW',
    rating: 1652,
    wins: 98,
    losses: 61,
    draws: 11,
    streak: 3,
    preferred_language: 'python',
    bio: 'Python wizard. ML engineer by day, coder by night.',
    created_at: '2025-02-14T00:00:00Z',
  },
  {
    id: 'user-003',
    username: 'CipherGhost',
    email: 'cipher@codeduel.io',
    avatar: 'CG',
    rating: 2105,
    wins: 289,
    losses: 47,
    draws: 12,
    streak: 18,
    preferred_language: 'typescript',
    bio: 'Top-ranked solver. LeetCode #43. Coffee-driven.',
    created_at: '2024-11-01T00:00:00Z',
  },
  {
    id: 'user-004',
    username: 'Qu4ntumCode',
    email: 'quantum@codeduel.io',
    avatar: 'QC',
    rating: 1420,
    wins: 54,
    losses: 72,
    draws: 8,
    streak: 0,
    preferred_language: 'javascript',
    bio: 'Still learning the craft.',
    created_at: '2025-06-01T00:00:00Z',
  },
];

export const MOCK_CURRENT_USER: Profile = {
  id: 'user-demo',
  username: 'DemoPlayer',
  email: 'demo@codeduel.io',
  avatar: 'DP',
  rating: 1537,
  wins: 76,
  losses: 52,
  draws: 3,
  streak: 4,
  preferred_language: 'javascript',
  bio: 'Ready to duel. Let the best algorithm win.',
  created_at: '2025-03-15T00:00:00Z',
};

// ─── Mock Recent Matches ──────────────────────────────────────────────────────
export const MOCK_RECENT_MATCHES: RecentMatch[] = [
  { id: 'm1', opponent: 'ByteWitch', result: 'win', rating_delta: +18, problem_title: 'Two Sum', difficulty: 'Easy', played_at: '2026-04-08T10:00:00Z' },
  { id: 'm2', opponent: 'NeuralStrike', result: 'loss', rating_delta: -14, problem_title: 'Longest Substring', difficulty: 'Medium', played_at: '2026-04-07T18:30:00Z' },
  { id: 'm3', opponent: 'Qu4ntumCode', result: 'win', rating_delta: +12, problem_title: 'Binary Search', difficulty: 'Easy', played_at: '2026-04-07T14:00:00Z' },
  { id: 'm4', opponent: 'CipherGhost', result: 'loss', rating_delta: -22, problem_title: 'Maximum Subarray', difficulty: 'Medium', played_at: '2026-04-06T20:00:00Z' },
  { id: 'm5', opponent: 'ByteWitch', result: 'win', rating_delta: +15, problem_title: 'Valid Parentheses', difficulty: 'Easy', played_at: '2026-04-06T09:00:00Z' },
];

// ─── Mock Leaderboard ─────────────────────────────────────────────────────────
export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, profile: MOCK_PROFILES[2], win_rate: 85.5 },
  { rank: 2, profile: MOCK_PROFILES[0], win_rate: 78.9 },
  { rank: 3, profile: MOCK_PROFILES[1], win_rate: 61.6 },
  { rank: 4, profile: MOCK_CURRENT_USER, win_rate: 59.4 },
  { rank: 5, profile: MOCK_PROFILES[3], win_rate: 42.9 },
];

// ─── Default Code Stubs ───────────────────────────────────────────────────────
export const DEFAULT_STUBS: Record<string, Record<string, string>> = {
  'prob-001': {
    javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  // Write your solution here
  
}`,
    python: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        # Write your solution here
        pass`,
    typescript: `function twoSum(nums: number[], target: number): number[] {
  // Write your solution here
  
}`,
    c: `#include <stdio.h>
#include <stdlib.h>

/**
 * Note: The returned array must be malloced, assume caller calls free().
 */
int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    // Write your solution here
    
}`,
    cpp: `#include <vector>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your solution here
        
    }
};`,
  },
  'prob-002': {
    javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
  // Write your solution here
  
}`,
    python: `class Solution:
    def isValid(self, s: str) -> bool:
        # Write your solution here
        pass`,
    typescript: `function isValid(s: string): boolean {
  // Write your solution here
  
}`,
    c: `#include <stdbool.h>

bool isValid(char* s) {
    // Write your solution here
    
}`,
    cpp: `#include <string>
#include <stack>
using namespace std;

class Solution {
public:
    bool isValid(string s) {
        // Write your solution here
        
    }
};`,
  },
  default: {
    javascript: `// Write your solution here
function solution() {
  
}`,
    python: `# Write your solution here
def solution():
    pass`,
    typescript: `// Write your solution here
function solution(): void {
  
}`,
    c: `#include <stdio.h>

void solution() {
    // Write your solution here
    
}`,
    cpp: `#include <iostream>
using namespace std;

class Solution {
public:
    void solution() {
        // Write your solution here
        
    }
};`,
  },
};

export function getStub(problemId: string, language: string): string {
  return DEFAULT_STUBS[problemId]?.[language] ?? DEFAULT_STUBS.default[language] ?? '// Start coding...';
}

export function getRandomProblem(difficulty?: string): Problem {
  const filtered = difficulty
    ? MOCK_PROBLEMS.filter((p) => p.difficulty === difficulty)
    : MOCK_PROBLEMS;
  return filtered[Math.floor(Math.random() * filtered.length)];
}

export function getRatingTier(rating: number): { label: string; color: string } {
  if (rating >= 2000) return { label: 'Grand Master', color: 'text-rose-400' };
  if (rating >= 1800) return { label: 'Master', color: 'text-amber-400' };
  if (rating >= 1600) return { label: 'Diamond', color: 'text-cyan-400' };
  if (rating >= 1400) return { label: 'Platinum', color: 'text-violet-400' };
  if (rating >= 1200) return { label: 'Gold', color: 'text-yellow-400' };
  if (rating >= 1000) return { label: 'Silver', color: 'text-zinc-300' };
  return { label: 'Bronze', color: 'text-orange-500' };
}
