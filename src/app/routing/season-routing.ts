export type Locale = 'en' | 'fr';
export type Season = 'winter' | 'summer';

const ROUTE_SEGMENTS: Record<Locale, Record<Season, string>> = {
  en: { winter: 'winter', summer: 'summer' },
  fr: { winter: 'hiver', summer: 'ete' },
};

export function localeFromAngularLocaleId(localeId: string): Locale {
  return localeId.toLowerCase().startsWith('fr') ? 'fr' : 'en';
}

export function seasonRouteSegment(locale: Locale, season: Season): string {
  return ROUTE_SEGMENTS[locale][season];
}

export function seasonPath(locale: Locale, season: Season): string {
  return `/${seasonRouteSegment(locale, season)}`;
}

