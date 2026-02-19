/**
 * Utility functions for Bangla numeral conversion and normalization
 * Supports: English (0-9) and Bangla (০-९) numerals
 */

// Bangla numerals
const BANGLA_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

// English numerals
const ENGLISH_DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

/**
 * Convert English numerals to Bangla numerals
 */
export function toBanglaNumeral(input: string): string {
  if (!input) return input;

  let result = input;

  // Convert English numerals to Bangla
  for (let i = 0; i < 10; i++) {
    result = result.replace(new RegExp(ENGLISH_DIGITS[i], 'g'), BANGLA_DIGITS[i]);
  }

  return result;
}

/**
 * Normalize Bangla numerals to English numerals for searching/comparison
 */
export function normalizeToEnglish(input: string): string {
  if (!input) return input;

  let result = input;

  // Convert Bangla numerals to English
  for (let i = 0; i < 10; i++) {
    result = result.replace(new RegExp(BANGLA_DIGITS[i], 'g'), ENGLISH_DIGITS[i]);
  }

  return result;
}

/**
 * Check if a string contains only Bangla numerals and allowed separators
 */
export function isBanglaNumeral(input: string): boolean {
  const banglaNumPattern = /^[০-৯\-\s]*$/;
  return banglaNumPattern.test(input);
}

/**
 * Check if a string contains only English numerals and allowed separators
 */
export function isEnglishNumeral(input: string): boolean {
  const englishNumPattern = /^[0-9\-\s]*$/;
  return englishNumPattern.test(input);
}
