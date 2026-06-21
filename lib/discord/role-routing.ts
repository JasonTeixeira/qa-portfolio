import { sageLevelOptions, sagePathOptions, type SageLevelKey, type SagePathKey } from './sage-content';

export type DiscordRoleRoutingInput = {
  currentPathKey?: string | null;
  currentLevelKey?: string | null;
  nextPathKey?: string | null;
  nextLevelKey?: string | null;
};

export type DiscordRoleRoutingPlan = {
  finalPathKey: SagePathKey | null;
  finalLevelKey: SageLevelKey | null;
  pathRole: string | null;
  levelRole: string | null;
  channel: string | null;
  rolesToAdd: string[];
  rolesToRemove: string[];
};

function validPathKey(value?: string | null): SagePathKey | null {
  return sagePathOptions.some((option) => option.key === value) ? value as SagePathKey : null;
}

function validLevelKey(value?: string | null): SageLevelKey | null {
  return sageLevelOptions.some((option) => option.key === value) ? value as SageLevelKey : null;
}

function unique(values: Array<string | null | undefined>): string[] {
  return [...new Set(values.filter(Boolean) as string[])];
}

function pathFor(key?: string | null) {
  const valid = validPathKey(key);
  return valid ? sagePathOptions.find((option) => option.key === valid) ?? null : null;
}

function levelFor(key?: string | null) {
  const valid = validLevelKey(key);
  return valid ? sageLevelOptions.find((option) => option.key === valid) ?? null : null;
}

function removableRole(role: string | null | undefined, stillNeeded: Set<string>): string | null {
  if (!role || role === 'Academy Member') return null;
  return stillNeeded.has(role) ? null : role;
}

export function planDiscordRoleRouting(input: DiscordRoleRoutingInput): DiscordRoleRoutingPlan {
  const currentPathKey = validPathKey(input.currentPathKey);
  const currentLevelKey = validLevelKey(input.currentLevelKey);
  const finalPathKey = input.nextPathKey === undefined ? currentPathKey : validPathKey(input.nextPathKey);
  const finalLevelKey = input.nextLevelKey === undefined ? currentLevelKey : validLevelKey(input.nextLevelKey);

  const currentPath = pathFor(currentPathKey);
  const currentLevel = levelFor(currentLevelKey);
  const finalPath = pathFor(finalPathKey);
  const finalLevel = levelFor(finalLevelKey);
  const rolesToAdd = unique(['Academy Member', finalPath?.role, finalLevel?.role]);
  const stillNeeded = new Set(rolesToAdd);
  const rolesToRemove = unique([
    currentPathKey !== finalPathKey ? removableRole(currentPath?.role, stillNeeded) : null,
    currentLevelKey !== finalLevelKey ? removableRole(currentLevel?.role, stillNeeded) : null,
  ]);

  return {
    finalPathKey,
    finalLevelKey,
    pathRole: finalPath?.role ?? null,
    levelRole: finalLevel?.role ?? null,
    channel: finalPath?.channel ?? null,
    rolesToAdd,
    rolesToRemove,
  };
}
