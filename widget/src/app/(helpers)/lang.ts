export const languageCodes = [
  'en',
  'es',
  'de',
  'zh',
  'fr',
  'ar',
  'bn',
  'pa',
] as const;
export const languages = [
  'English',
  'Spanish',
  'German',
  'Chinese',
  'French',
  'Arabic',
  'Bengali',
  'Punjabi (Panjabi)',
];
export type LanguageCode = (typeof languageCodes)[number];
export const languageCodeMap = languageCodes.map((langCode, i) => ({
  [langCode]: languages[i],
}));
