// ── Input & Parsing ──────────────────────────────────────────────────────────

export interface ParsedInput {
  raw: string;
  username: string | null;
  error: 'EMPTY' | 'INVALID_FORMAT' | null;
}

// ── GitHub API response shapes ────────────────────────────────────────────────

export interface GitHubRESTUser {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  created_at: string;         // ISO 8601
  followers: number;
  following: number;
  public_repos: number;
  public_gists: number;
}

export interface GitHubRESTRepository {
  name: string;
  pushed_at: string;
  stargazers_count?: number;
  forks_count?: number;
  language?: string | null;
  license?: { key: string } | null;
  open_issues_count?: number;
}

export interface GitHubRepository {
  name: string;
  pushedAt: string;
  hasReadme: boolean;
  hasLicense: boolean;
  hasContributing: boolean;
  openIssuesCount: number;
}

export interface GitHubGraphQLStats {
  totalCommitContributions: number;
  totalPullRequestContributions: number;
  totalIssueContributions: number;
  totalRepositoryContributions: number;
  totalDiscussionContributions: number;
  starsReceived: number;
  forksReceived: number;
  mergedPRsOnExternalRepos: number;
  contributorsToUserRepos: number;
  languages: LanguageEntry[];
  totalGists: number;
  totalPackages: number;
  repositories: GitHubRepository[];
}

export interface LanguageEntry {
  name: string;
  bytes: number;
  color: string;
  percentage?: number;  // added by computeTopLanguages
}

export interface GitHubEvent {
  type: string;
  created_at: string;         // ISO 8601
  repo: { name: string };
  payload: Record<string, unknown>;
}

export interface GitHubOrg {
  login: string;
  avatar_url: string;
}

// ── Normalised profile (post-Analyzer) ───────────────────────────────────────

export interface GitHubProfile {
  username: string;
  name: string;
  avatarUrl: string;
  bio: string;
  createdAt: Date;
  accountAgeYears: number;
  followers: number;
  following: number;
  publicRepos: number;
  totalCommits: number;
  totalPRs: number;
  totalIssues: number;
  totalDiscussions: number;
  totalGists: number;
  totalPackages: number;
  starsReceived: number;
  forksReceived: number;
  mergedExternalPRs: number;
  contributorsToRepos: number;
  organizations: GitHubOrg[];
  languages: LanguageEntry[];
  recentEvents: GitHubEvent[];
  fetchedAt: Date;
  repositories: GitHubRepository[];
}

// ── Badge types ───────────────────────────────────────────────────────────────

export type BadgeTier = 'Bronze' | 'Silver' | 'Gold' | 'None';
export type BadgeRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Secret';
export type BadgeStatus = 'Unlocked' | 'Locked' | 'InProgress';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface ChecklistItem {
  id: string;
  label: string;
  met: boolean;
}

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  iconPath: string;
  rarity: BadgeRarity;
  tiers: BadgeTierDefinition[];
  difficulty: Difficulty;
  checklistItems: ChecklistItemDefinition[];
  metricKey: keyof GitHubProfile;
  secret: boolean;
}

export interface BadgeTierDefinition {
  tier: BadgeTier;
  threshold: number;
}

export interface ChecklistItemDefinition {
  id: string;
  label: string;
  evaluate: (profile: GitHubProfile) => boolean;
}

export interface BadgeEvaluation {
  definition: BadgeDefinition;
  status: BadgeStatus;
  currentValue: number;
  threshold: number;
  progress: number;          // 0–100
  currentTier: BadgeTier;
  nextTier: BadgeTier | null;
  earnedAt: Date | null;
  checklistItems: ChecklistItem[];
  checklistCompletion: number;   // 0–100
}

// ── Score types ────────────────────────────────────────────────────────────────

export interface ScoreResult {
  githubScore: number;
  openSourceScore: number;
}

// ── Roadmap types ─────────────────────────────────────────────────────────────

export interface RoadmapStep {
  id: string;
  action: string;
  targetBadgeId: string;
  estimatedDays: number;
  difficulty: Difficulty;
  completed: boolean;
}

export interface RoadmapResult {
  nextBadge: BadgeEvaluation | undefined;
  steps: RoadmapStep[];
  totalEstimatedDays: number;
  estimatedCompletionDate: Date;
  activityRate: number | null;
}

// ── Leaderboard types ─────────────────────────────────────────────────────────

export type LeaderboardTab = 'mostBadges' | 'fastestGrowth' | 'mostContributions' | 'mostPRs';

export interface LeaderboardEntry {
  username: string;
  avatarUrl: string;
  badgeCount: number;
  badgesLast30Days: number;
  totalContributions: number;
  totalPRs: number;
  trend: 'up' | 'down' | 'new';
  rank: number;
}

// ── Search History types ──────────────────────────────────────────────────────

export interface SearchHistoryEntry {
  username: string;
  analyzedAt: string;    // ISO 8601
}

// ── Error types ───────────────────────────────────────────────────────────────

export type ErrorCode =
  | 'GBT_ERR_NOT_FOUND'
  | 'GBT_ERR_RATE_LIMITED'
  | 'GBT_ERR_UNKNOWN';

export class AnalyzerError extends Error {
  constructor(
    public readonly code: ErrorCode,
    public readonly httpStatus: number,
    message: string,
  ) {
    super(message);
    this.name = 'AnalyzerError';
  }
}
