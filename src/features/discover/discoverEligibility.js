export const MIN_DISCOVER_AGE = 18;

export function isDiscoverEligible(age) {
  const numericAge = Number(age);

  return Number.isFinite(numericAge) && numericAge >= MIN_DISCOVER_AGE;
}