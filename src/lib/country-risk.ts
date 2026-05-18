import countriesRisk from '../../countries-risk.json';

// Build a lookup map from country name (lowercase) to risk level
const countryRiskMap = new Map<string, 'low' | 'medium' | 'high'>();
for (const country of countriesRisk.eudr_country_risk_classification
  .high_risk) {
  countryRiskMap.set(country.toLowerCase(), 'high');
}
for (const country of countriesRisk.eudr_country_risk_classification
  .standard_risk) {
  countryRiskMap.set(country.toLowerCase(), 'medium');
}
for (const country of countriesRisk.eudr_country_risk_classification.low_risk) {
  countryRiskMap.set(country.toLowerCase(), 'low');
}

/**
 * Derive supplier risk level from country using the EUDR country risk classification.
 * Maps high_risk → 'high', standard_risk → 'medium', low_risk → 'low'.
 * Falls back to 'medium' if the country is not found.
 */
export function getRiskLevelFromCountry(
  country: string | undefined
): 'low' | 'medium' | 'high' {
  if (!country) return 'medium';
  return countryRiskMap.get(country.toLowerCase()) ?? 'medium';
}
