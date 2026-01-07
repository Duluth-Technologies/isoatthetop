import { Injectable } from '@angular/core';

export type Season = 'winter' | 'summer';

const STORAGE_KEY = 'isoatthetop:season';

@Injectable({ providedIn: 'root' })
export class SeasonPreferenceService {
  getPreferredSeason(): Season | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'winter' || stored === 'summer') return stored;
    } catch {
      // ignore
    }
    return null;
  }

  setPreferredSeason(season: Season): void {
    try {
      localStorage.setItem(STORAGE_KEY, season);
    } catch {
      // ignore
    }
  }
}

