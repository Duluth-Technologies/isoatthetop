import { Component, OnInit, inject, LOCALE_ID } from '@angular/core';
import { Router } from '@angular/router';

import { localeFromAngularLocaleId, seasonPath, type Season } from '../routing/season-routing';

@Component({
  selector: 'app-home-redirect-page',
  standalone: true,
  template: '',
})
export class HomeRedirectPage implements OnInit {
  private readonly router = inject(Router);
  private readonly localeId = inject(LOCALE_ID);

  ngOnInit(): void {
    const locale = localeFromAngularLocaleId(this.localeId);
    const season = this.preferredSeason();
    const path = seasonPath(locale, season);
    this.router.navigateByUrl(path, { replaceUrl: true }).catch(() => {
      // ignore
    });
  }

  private preferredSeason(): Season {
    try {
      const stored = localStorage.getItem('isoatthetop:season');
      if (stored === 'winter' || stored === 'summer') return stored;
    } catch {
      // ignore
    }

    const now = new Date();
    const year = now.getFullYear();
    const startWinter = new Date(year, 7, 15); // Aug 15
    const endWinter = new Date(year, 3, 15); // Apr 15
    const isWinter = now >= startWinter || now <= endWinter;
    return isWinter ? 'winter' : 'summer';
  }
}
