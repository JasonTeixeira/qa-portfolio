export type MlLeadFeatures = {
  fit: number;
  urgency: number;
  contactConfidence: number;
  pastReplyRate: number;
};

export type MlScoringModel = {
  modelVersion: string;
  weights: MlLeadFeatures;
  bias: number;
  sampleSize: number;
};

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function normalize(value: number) {
  return Math.max(0, Math.min(1, value / 100));
}

function sigmoid(value: number) {
  return 1 / (1 + Math.exp(-value));
}

export function buildMlScoringModel(input: {
  modelVersion: string;
  outcomes: Array<{ features: MlLeadFeatures; won: boolean }>;
}): MlScoringModel {
  const positives = input.outcomes.filter((row) => row.won);
  const negatives = input.outcomes.filter((row) => !row.won);
  const average = (rows: typeof input.outcomes, key: keyof MlLeadFeatures) =>
    rows.length ? rows.reduce((sum, row) => sum + row.features[key], 0) / rows.length : 0;
  const weightFor = (key: keyof MlLeadFeatures) => normalize(average(positives, key) - average(negatives, key));
  return {
    modelVersion: input.modelVersion,
    weights: {
      fit: 0.35 + weightFor('fit'),
      urgency: 0.25 + weightFor('urgency'),
      contactConfidence: 0.25 + weightFor('contactConfidence'),
      pastReplyRate: 0.15 + weightFor('pastReplyRate'),
    },
    bias: positives.length >= negatives.length ? 0.1 : -0.1,
    sampleSize: input.outcomes.length,
  };
}

export function scoreWithMlModel(input: {
  model: MlScoringModel;
  ruleScore: number;
  features: MlLeadFeatures;
}) {
  const raw =
    normalize(input.features.fit) * input.model.weights.fit +
    normalize(input.features.urgency) * input.model.weights.urgency +
    normalize(input.features.contactConfidence) * input.model.weights.contactConfidence +
    normalize(input.features.pastReplyRate) * input.model.weights.pastReplyRate +
    input.model.bias;
  const calibratedProbability = sigmoid(raw * 3 - 1.5);
  const learnedScore = clamp(calibratedProbability * 100);
  const blendedScore = clamp(input.ruleScore * 0.55 + learnedScore * 0.45);
  return {
    modelVersion: input.model.modelVersion,
    ruleScore: input.ruleScore,
    learnedScore,
    blendedScore,
    calibratedProbability,
    decision: blendedScore >= 70 || learnedScore >= 75 ? 'prioritize' : blendedScore >= 50 ? 'review' : 'deprioritize',
  };
}
