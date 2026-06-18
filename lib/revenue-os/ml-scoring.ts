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
  metrics?: {
    trainingAccuracy: number;
  };
  featureImportance?: MlLeadFeatures;
};

export type MlFeatureSnapshot = {
  tenantId: string;
  accountId: string;
  source: string;
  industry: string;
  offer: string;
  features: MlLeadFeatures;
  ruleScore: number;
  capturedAt: string;
};

export type MlOutcomeLabel = {
  tenantId: string;
  accountId: string;
  outcome: 'won' | 'meeting' | 'lost' | 'no_reply';
  value?: number;
  labeledAt: string;
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

export function buildMlFeatureSnapshot(input: Omit<MlFeatureSnapshot, 'capturedAt'> & { capturedAt?: string }): MlFeatureSnapshot {
  return {
    ...input,
    features: {
      fit: clamp(input.features.fit),
      urgency: clamp(input.features.urgency),
      contactConfidence: clamp(input.features.contactConfidence),
      pastReplyRate: clamp(input.features.pastReplyRate),
    },
    ruleScore: clamp(input.ruleScore),
    capturedAt: input.capturedAt ?? new Date().toISOString(),
  };
}

export function buildMlOutcomeLabel(input: Omit<MlOutcomeLabel, 'labeledAt'> & { labeledAt?: string }): MlOutcomeLabel {
  return {
    ...input,
    labeledAt: input.labeledAt ?? new Date().toISOString(),
  };
}

function positiveOutcome(label?: MlOutcomeLabel) {
  return label?.outcome === 'won' || label?.outcome === 'meeting';
}

export function trainRevenueMlModel(input: {
  tenantId: string;
  modelVersion: string;
  snapshots: MlFeatureSnapshot[];
  labels: MlOutcomeLabel[];
}) {
  const labelByAccount = new Map(input.labels.map((label) => [label.accountId, label]));
  const outcomes = input.snapshots
    .map((snapshot) => {
      const label = labelByAccount.get(snapshot.accountId);
      if (!label) return null;
      return { features: snapshot.features, won: positiveOutcome(label) };
    })
    .filter((row): row is { features: MlLeadFeatures; won: boolean } => Boolean(row));

  const model = buildMlScoringModel({
    modelVersion: input.modelVersion,
    outcomes,
  });
  const decisions = input.snapshots.map((snapshot) =>
    scoreWithMlModel({ model, ruleScore: snapshot.ruleScore, features: snapshot.features }),
  );
  const correct = decisions.filter((decision, index) => {
    const label = labelByAccount.get(input.snapshots[index].accountId);
    const predictedPositive = decision.decision === 'prioritize' || decision.blendedScore >= 60;
    return predictedPositive === positiveOutcome(label);
  }).length;
  const featureImportance = {
    fit: Math.abs(model.weights.fit),
    urgency: Math.abs(model.weights.urgency),
    contactConfidence: Math.abs(model.weights.contactConfidence),
    pastReplyRate: Math.abs(model.weights.pastReplyRate),
  };

  return {
    ...model,
    tenantId: input.tenantId,
    metrics: {
      trainingAccuracy: outcomes.length ? correct / outcomes.length : 0,
    },
    featureImportance,
  };
}

export function scoreRevenueMlDecision(input: {
  tenantId: string;
  accountId: string;
  model: MlScoringModel;
  snapshot: MlFeatureSnapshot;
}) {
  const scored = scoreWithMlModel({
    model: input.model,
    ruleScore: input.snapshot.ruleScore,
    features: input.snapshot.features,
  });
  return {
    ...scored,
    tenantId: input.tenantId,
    accountId: input.accountId,
    snapshot: input.snapshot,
    persistence: {
      tenant_id: input.tenantId,
      account_id: input.accountId,
      model_version: input.model.modelVersion,
      rule_score: scored.ruleScore,
      learned_score: scored.learnedScore,
      blended_score: scored.blendedScore,
      calibrated_probability: scored.calibratedProbability,
      decision: scored.decision,
      feature_snapshot: input.snapshot,
    },
  };
}

export function buildMlCalibrationReport(input: {
  tenantId: string;
  model: MlScoringModel;
  decisions: Array<ReturnType<typeof scoreRevenueMlDecision>>;
  labels: MlOutcomeLabel[];
}) {
  const labelByAccount = new Map(input.labels.map((label) => [label.accountId, label]));
  const scored = input.decisions
    .map((decision) => {
      const label = labelByAccount.get(decision.accountId);
      if (!label) return null;
      const actual = positiveOutcome(label) ? 1 : 0;
      const probability = decision.calibratedProbability;
      return { probability, actual };
    })
    .filter((row): row is { probability: number; actual: number } => Boolean(row));
  const brierScore = scored.length
    ? scored.reduce((sum, row) => sum + (row.probability - row.actual) ** 2, 0) / scored.length
    : 0;
  const bands = [
    { label: 'low', min: 0, max: 0.49, count: scored.filter((row) => row.probability < 0.5).length },
    { label: 'high', min: 0.5, max: 1, count: scored.filter((row) => row.probability >= 0.5).length },
  ];

  return {
    tenantId: input.tenantId,
    modelVersion: input.model.modelVersion,
    brierScore,
    bands,
    driftWarnings: input.model.sampleSize < 20 ? ['low_sample_size'] : [],
    persistence: {
      tenant_id: input.tenantId,
      model_version: input.model.modelVersion,
      brier_score: brierScore,
      bands,
      drift_warnings: input.model.sampleSize < 20 ? ['low_sample_size'] : [],
    },
  };
}
