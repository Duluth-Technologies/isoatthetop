import { Injectable, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

/**
 * Service de tracking analytics avec GoatCounter (sans cookies).
 * Enregistre automatiquement les changements de page dans l'application.
 */
@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private readonly router = inject(Router);

  /**
   * Initialise le tracking des changements de route.
   * À appeler une fois au démarrage de l'application.
   */
  initialize(): void {
    // Vérifie si GoatCounter est disponible
    if (!this.isGoatCounterAvailable()) {
      console.warn('GoatCounter n\'est pas configuré. Consultez index.html pour l\'activer.');
      return;
    }

    // Track la page initiale
    this.trackPageView(window.location.pathname + window.location.search);

    // Track les changements de route Angular
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.trackPageView(event.urlAfterRedirects);
      });
  }

  /**
   * Enregistre une page vue dans GoatCounter.
   * @param path Le chemin de la page à enregistrer
   */
  private trackPageView(path: string): void {
    if (!this.isGoatCounterAvailable()) {
      return;
    }

    try {
      // GoatCounter expose une fonction globale 'count' pour tracker les pages
      const goatcounter = (window as any).goatcounter;
      if (goatcounter && typeof goatcounter.count === 'function') {
        goatcounter.count({
          path: path
        });
      }
    } catch (error) {
      console.error('Erreur lors du tracking de la page:', error);
    }
  }

  /**
   * Vérifie si GoatCounter est disponible dans le DOM.
   */
  private isGoatCounterAvailable(): boolean {
    return typeof window !== 'undefined' && !!(window as any).goatcounter;
  }
}
