// lib/engines/badge-engine.ts

import { BADGE_DEFINITIONS } from '@/lib/data/badge-definitions';
import type {
  BadgeDefinition,
  BadgeEvaluation,
  BadgeStatus,
  BadgeTier,
  ChecklistItem,
  GitHubProfile,
} from '@/types';

export class BadgeEngine {
  evaluate(profile: GitHubProfile): BadgeEvaluation[] {
    return BADGE_DEFINITIONS.map((def) => this.evaluateOne(def, profile));
  }

  private evaluateOne(def: BadgeDefinition, profile: GitHubProfile): BadgeEvaluation {
    const currentValue = profile[def.metricKey] as number;

    // Determine highest earned tier and next tier threshold
    const earnedTiers = def.tiers.filter((t) => currentValue >= t.threshold);
    const currentTier: BadgeTier = earnedTiers.at(-1)?.tier ?? 'None';
    const nextTierDef = def.tiers.find((t) => currentValue < t.threshold) ?? null;
    const threshold = nextTierDef?.threshold ?? def.tiers.at(-1)!.threshold;

    // Progress: ratio toward next tier, clamped 0–100
    const progress = nextTierDef
      ? Math.min(100, Math.max(0, (currentValue / threshold) * 100))
      : 100;

    const status: BadgeStatus =
      progress === 100 ? 'Unlocked' : currentValue > 0 ? 'InProgress' : 'Locked';

    // Evaluate checklist
    const checklistItems: ChecklistItem[] = def.checklistItems.map((ci) => ({
      id: ci.id,
      label: ci.label,
      met: ci.evaluate(profile),
    }));

    const checklistCompletion =
      checklistItems.length > 0
        ? Math.round((checklistItems.filter((c) => c.met).length / checklistItems.length) * 100)
        : 0;

    return {
      definition: def,
      status,
      currentValue,
      threshold,
      progress,
      currentTier,
      nextTier: nextTierDef?.tier ?? null,
      earnedAt: null, // set by Analyzer if derivable from events
      checklistItems,
      checklistCompletion,
    };
  }
}
