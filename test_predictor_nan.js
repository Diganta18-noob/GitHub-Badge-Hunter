const { predictBadges } = require('./lib/engines/badge-predictor');

const mockEvals = [
  {
    definition: {
      id: 'test-id',
      name: 'Badge test-id',
      description: '',
      iconPath: '',
      rarity: 'Common',
      tiers: [{ tier: 'Bronze', threshold: 10 }],
      difficulty: 'Easy',
      checklistItems: [],
      metricKey: 'totalCommits',
      secret: false,
    },
    status: 'Locked',
    currentValue: 2,
    threshold: 1,
    progress: 0,
    currentTier: 'None',
    nextTier: 'Bronze',
    earnedAt: null,
    checklistItems: [],
    checklistCompletion: 0,
  }
];

const activityRate = 5e-324;
const result = predictBadges(mockEvals, activityRate);
console.log('Result:', JSON.stringify(result, null, 2));
