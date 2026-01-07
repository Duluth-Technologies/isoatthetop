import { Component, inject, LOCALE_ID, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  localeFromAngularLocaleId,
  seasonPath,
  type Locale,
  type Season,
} from '../routing/season-routing';
import { SiteDataService } from '../services/site-data.service';

interface ContactConfig {
  email?: string;
  phone?: string;
}

@Component({
  selector: 'app-mentions-legales-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './mentions-legales.page.html',
})
export class MentionsLegalesPage implements OnInit {
  private readonly localeId = inject(LOCALE_ID);
  private readonly data = inject(SiteDataService);
  protected readonly locale: Locale = localeFromAngularLocaleId(this.localeId);
  protected readonly year = new Date().getFullYear();
  protected contact: ContactConfig = { email: 'contact@isoatthetop.com', phone: '' };
  protected phoneRevealed = false;
  private readonly defaultPhone = '+33 6 51 18 58 62';

  protected seasonPath(season: Season): string {
    return seasonPath(this.locale, season);
  }

  ngOnInit(): void {
    this.data.getJson<ContactConfig>('data/config.json').subscribe({
      next: (cfg) => (this.contact = { ...this.contact, ...cfg }),
      error: () => {
        // keep defaults
      },
    });
  }

  protected otherLocaleHref(targetLocale: Locale): string {
    const rawBase = document.querySelector('base')?.getAttribute('href') ?? '/';
    const basePath = rawBase.startsWith('http') ? new URL(rawBase).pathname : rawBase;
    const normalizedBase = basePath.endsWith('/') ? basePath : `${basePath}/`;

    const match = normalizedBase.match(/^(.*\/)(en|fr)\/$/);
    const siteRoot = match ? match[1] : normalizedBase;

    return `${siteRoot}${targetLocale}/mentions-legales/`;
  }

  protected phoneValue(): string {
    const raw = this.contact.phone || this.defaultPhone;
    const digits = raw.replace(/\D/g, '');

    if (/^0\d{9}$/.test(digits)) {
      const national = digits.slice(1);
      return `+33 ${national[0]} ${national.slice(1, 3)} ${national.slice(3, 5)} ${national.slice(5, 7)} ${national.slice(7, 9)}`;
    }

    if (/^33\d{9}$/.test(digits)) {
      const national = digits.slice(2);
      return `+33 ${national[0]} ${national.slice(1, 3)} ${national.slice(3, 5)} ${national.slice(5, 7)} ${national.slice(7, 9)}`;
    }

    return raw;
  }

  protected phoneHref(): string {
    const compact = this.phoneValue().replace(/\s+/g, '');
    if (compact.startsWith('+')) return `tel:${compact}`;

    const digits = compact.replace(/\D/g, '');
    if (/^0\d{9}$/.test(digits)) return `tel:+33${digits.slice(1)}`;
    if (/^33\d{9}$/.test(digits)) return `tel:+${digits}`;

    return `tel:${digits || compact}`;
  }

  protected revealPhone(): void {
    this.phoneRevealed = true;
  }
}
