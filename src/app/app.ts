import { Component, inject, LOCALE_ID } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { localeFromAngularLocaleId } from './routing/season-routing';
import { AnalyticsService } from './services/analytics.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly router = inject(Router);
  private readonly localeId = inject(LOCALE_ID);
  private readonly analytics = inject(AnalyticsService);

  constructor() {
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      document.documentElement.lang = localeFromAngularLocaleId(this.localeId);
    });

    // Initialise le tracking analytics
    this.analytics.initialize();
  }

  // Routing now depends on locale base href; no per-route lang needed.
}
