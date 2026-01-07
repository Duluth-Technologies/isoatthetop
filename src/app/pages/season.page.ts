import { CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject, LOCALE_ID, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';

import {
  localeFromAngularLocaleId,
  seasonPath,
  seasonRouteSegment,
  type Locale,
  type Season,
} from '../routing/season-routing';
import { SiteDataService } from '../services/site-data.service';
import { SeasonPreferenceService } from '../services/season-preference.service';

type SectionKey =
  | 'main'
  | 'station'
  | 'apartment'
  | 'booking'
  | 'pricing'
  | 'access'
  | 'contact'
  | 'gallery'
  | 'activities'
  | 'included'
  | 'reviews'
  | 'slopes-map';

const SECTION_IDS: Record<Locale, Record<SectionKey, string>> = {
  fr: {
    main: 'main',
    station: 'station',
    apartment: 'appartement',
    booking: 'reserver',
    pricing: 'tarifs',
    access: 'acces',
    contact: 'contact',
    gallery: 'galerie',
    activities: 'activites',
    included: 'inclus',
    reviews: 'avis',
    'slopes-map': 'plan-des-pistes',
  },
  en: {
    main: 'main',
    station: 'station',
    apartment: 'apartment',
    booking: 'booking',
    pricing: 'pricing',
    access: 'access',
    contact: 'contact',
    gallery: 'gallery',
    activities: 'activities',
    included: 'included',
    reviews: 'reviews',
    'slopes-map': 'slopes-map',
  },
};

type WeekStatus = 'available' | 'option' | 'booked';

interface WeekRow {
  season: Season;
  start: string;
  end: string;
  price: number;
  status: WeekStatus;
  holidays: string[];
}

interface MediaItem {
  season: Season;
  src: string;
  alt: Partial<Record<Locale, string>>;
  caption: Partial<Record<Locale, string>>;
}

interface ReviewsData {
  ratingText?: Partial<Record<Locale, string>>;
  reviews?: Review[];
}

interface Review {
  excerpt?: Partial<Record<Locale, string>>;
  tripType?: Partial<Record<Locale, string>>;
  date?: string;
  source?: string;
}

interface ContactConfig {
  brandName?: string;
  email?: string;
  phone?: string;
  addressLocality?: string;
  formEndpoint?: string;
}

@Component({
  selector: 'app-season-page',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './season.page.html',
})
export class SeasonPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly localeId = inject(LOCALE_ID);
  private readonly data = inject(SiteDataService);
  private readonly seasonPref = inject(SeasonPreferenceService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly http = inject(HttpClient);
  private readonly titleService = inject(Title);
  private readonly metaService = inject(Meta);
  private readonly dayMonthFmt = new Intl.DateTimeFormat(this.localeId, { day: '2-digit', month: 'short' });

  protected readonly locale: Locale = localeFromAngularLocaleId(this.localeId);
  protected season: Season = 'winter';
  protected gallerySeason: Season = 'winter';
  protected phoneRevealed = false;
  protected emailRevealed = false;
  protected formSubmitting = false;
  protected formSuccess = false;
  protected formError = false;

  private readonly defaultPhone = '+33 6 51 18 58 62';
  protected contact: ContactConfig = {
    brandName: 'Iso At The Top',
    email: 'contact@isoatthetop.com',
    phone: '',
    addressLocality: this.locale === 'fr' ? 'Isola 2000 (Alpes-Maritimes)' : 'Isola 2000 (French Alps)',
    formEndpoint: '',
  };

  protected weeks: WeekRow[] = [];
  protected media: MediaItem[] = [];
  protected reviews: ReviewsData = {};

  protected lightboxOpen = false;
  protected lightboxSrc = '';
  protected lightboxAlt = '';
  protected lightboxCaption = '';
  protected lightboxZoomable = false;
  protected lightboxZoom = 1;
  
  private isDragging = false;
  private startX = 0;
  private startY = 0;
  private scrollLeft = 0;
  private scrollTop = 0;

  constructor() {
    this.route.data.subscribe((data) => {
      const season = data['season'] === 'summer' ? 'summer' : 'winter';
      this.season = season;
      this.seasonPref.setPreferredSeason(season);
      this.updateSeoTags();
    });
  }

  ngOnInit(): void {
    const preferred = this.seasonPref.getPreferredSeason();
    this.gallerySeason = preferred ?? this.season;

    this.data.getJson<ContactConfig>('data/config.json').subscribe({
      next: (cfg) => {
        this.contact = { ...this.contact, ...cfg };
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load config.json:', err);
        // keep defaults
      },
    });

    this.data.getJson<WeekRow[]>('data/weeks.json').subscribe({
      next: (rows) => {
        console.log('Loaded weeks.json:', rows);
        this.weeks = Array.isArray(rows) ? rows : [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load weeks.json:', err);
        this.weeks = [];
      },
    });

    this.data.getJson<MediaItem[]>('data/media.json').subscribe({
      next: (items) => {
        this.media = Array.isArray(items) ? items : [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load media.json:', err);
        this.media = [];
      },
    });

    this.data.getJson<ReviewsData>('data/reviews.json').subscribe({
      next: (data) => {
        this.reviews = data || {};
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load reviews.json:', err);
        this.reviews = {};
      },
    });
  }

  protected sectionId(section: SectionKey): string {
    return SECTION_IDS[this.locale][section];
  }

  protected seasonPath(season: Season): string {
    return seasonPath(this.locale, season);
  }

  protected setGallerySeason(season: Season): void {
    this.gallerySeason = season;
    this.seasonPref.setPreferredSeason(season);
  }

  protected galleryItems(): MediaItem[] {
    return this.media.filter((m) => m.season === this.gallerySeason);
  }

  protected mediaAlt(item: MediaItem): string {
    return item.alt?.[this.locale] || item.alt?.en || item.alt?.fr || '';
  }

  protected mediaCaption(item: MediaItem): string {
    return item.caption?.[this.locale] || item.caption?.en || item.caption?.fr || '';
  }

  protected openLightbox(item: MediaItem): void {
    this.lightboxOpen = true;
    this.lightboxSrc = item.src;
    this.lightboxAlt = this.mediaAlt(item);
    this.lightboxCaption = this.mediaCaption(item);
    this.lightboxZoomable = false;
    this.lightboxZoom = 1;
    document.documentElement.classList.add('no-scroll');
  }

  protected closeLightbox(): void {
    this.lightboxOpen = false;
    this.lightboxZoomable = false;
    this.lightboxZoom = 1;
    document.documentElement.classList.remove('no-scroll');
  }

  protected openSlopeMapLightbox(): void {
    this.lightboxOpen = true;
    this.lightboxSrc = 'media/hiver/plan-pistes-hd.jpg';
    this.lightboxAlt = this.locale === 'fr' ? 'Plan des pistes Isola 2000' : 'Isola 2000 ski slopes map';
    this.lightboxCaption = this.locale === 'fr' ? 'Plan des pistes Isola 2000' : 'Isola 2000 ski slopes map';
    this.lightboxZoomable = true;
    this.lightboxZoom = 1;
    document.documentElement.classList.add('no-scroll');
  }

  protected zoomIn(): void {
    this.lightboxZoom = Math.min(this.lightboxZoom + 0.5, 4);
  }

  protected zoomOut(): void {
    this.lightboxZoom = Math.max(this.lightboxZoom - 0.5, 1);
  }

  protected resetZoom(): void {
    this.lightboxZoom = 1;
  }

  protected onMouseDown(event: MouseEvent, container: HTMLElement): void {
    if (!this.lightboxZoomable || this.lightboxZoom <= 1) return;
    
    this.isDragging = true;
    this.startX = event.pageX - container.offsetLeft;
    this.startY = event.pageY - container.offsetTop;
    this.scrollLeft = container.scrollLeft;
    this.scrollTop = container.scrollTop;
    event.preventDefault();
  }

  protected onMouseMove(event: MouseEvent, container: HTMLElement): void {
    if (!this.isDragging) return;
    
    event.preventDefault();
    const x = event.pageX - container.offsetLeft;
    const y = event.pageY - container.offsetTop;
    const walkX = (x - this.startX) * 2;
    const walkY = (y - this.startY) * 2;
    container.scrollLeft = this.scrollLeft - walkX;
    container.scrollTop = this.scrollTop - walkY;
  }

  protected onMouseUp(): void {
    this.isDragging = false;
  }

  protected onMouseLeave(): void {
    this.isDragging = false;
  }

  protected weeksForSeason(): WeekRow[] {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Start of current day
    const filtered = this.weeks.filter((w) => {
      if (w.season !== this.season) return false;
      // Compare start date: only show weeks that haven't started yet
      const startDate = new Date(w.start);
      startDate.setHours(0, 0, 0, 0);
      return startDate > now;
    });
    console.log('weeksForSeason() called, season:', this.season, 'total weeks:', this.weeks.length, 'filtered:', filtered.length);
    return filtered;
  }

  protected weekLabel(startISO: string, endISO: string): string {
    const start = new Date(`${startISO}T00:00:00`);
    const end = new Date(`${endISO}T00:00:00`);
    return `${this.dayMonthFmt.format(start)} → ${this.dayMonthFmt.format(end)} ${start.getFullYear()}`;
  }

  protected ratingText(): string {
    return (
      this.reviews.ratingText?.[this.locale] ||
      this.reviews.ratingText?.en ||
      this.reviews.ratingText?.fr ||
      (this.locale === 'fr' ? '5 étoiles sur Airbnb' : '5-star rating on Airbnb')
    );
  }

  protected reviewExcerpt(review: Review): string {
    return review.excerpt?.[this.locale] || review.excerpt?.en || review.excerpt?.fr || '';
  }

  protected reviewTripType(review: Review): string {
    return review.tripType?.[this.locale] || review.tripType?.en || review.tripType?.fr || '';
  }

  protected statusLabel(status: WeekStatus): string {
    if (this.locale === 'fr') {
      if (status === 'available') return 'Disponible';
      if (status === 'option') return 'Option';
      if (status === 'booked') return 'Réservé';
      return status;
    }
    if (status === 'available') return 'Available';
    if (status === 'option') return 'Option';
    if (status === 'booked') return 'Booked';
    return status;
  }

  protected holidaysZones(holidays: unknown): Array<'A' | 'B' | 'C'> | null {
    if (!Array.isArray(holidays)) return null;
    const zones = holidays
      .filter((z): z is string => typeof z === 'string')
      .map((z) => z.trim().toUpperCase())
      .filter((z): z is 'A' | 'B' | 'C' => z === 'A' || z === 'B' || z === 'C');
    return zones;
  }

  protected holidaysLabel(holidays: unknown): string {
    if (!Array.isArray(holidays)) return this.locale === 'fr' ? 'Vacances non renseignées' : 'School holidays not set';
    if (holidays.length === 0) return this.locale === 'fr' ? 'Hors vacances scolaires' : 'No holidays';
    return '';
  }

  protected mailtoHref(email: string): string {
    return `mailto:${email}`;
  }

  protected telHref(phone: string): string {
    const compact = phone.replace(/\s+/g, '');
    if (compact.startsWith('+')) return `tel:${compact}`;

    const digits = phone.replace(/\D/g, '');
    if (/^0\d{9}$/.test(digits)) return `tel:+33${digits.slice(1)}`;
    if (/^33\d{9}$/.test(digits)) return `tel:+${digits}`;

    return `tel:${digits || compact}`;
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

  protected revealPhone(): void {
    this.phoneRevealed = true;
  }

  protected revealEmail(): void {
    this.emailRevealed = true;
  }

  protected copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(
      () => {
        console.log('Copied to clipboard:', text);
      },
      (err) => {
        console.error('Failed to copy:', err);
      }
    );
  }

  protected onContactSubmit(event: SubmitEvent): void {
    event.preventDefault();

    const form = event.target as HTMLFormElement | null;
    if (!form) return;

    // If formEndpoint is configured, send via AJAX
    if (this.contact.formEndpoint) {
      this.formSubmitting = true;
      this.formSuccess = false;
      this.formError = false;

      const formData = new FormData(form);
      
      this.http.post(this.contact.formEndpoint, formData).subscribe({
        next: () => {
          this.formSubmitting = false;
          this.formSuccess = true;
          form.reset();
          this.cdr.detectChanges();
          
          // Hide success message after 5 seconds
          setTimeout(() => {
            this.formSuccess = false;
            this.cdr.detectChanges();
          }, 5000);
        },
        error: (err) => {
          console.error('Form submission error:', err);
          this.formSubmitting = false;
          this.formError = true;
          this.cdr.detectChanges();
          
          // Hide error message after 5 seconds
          setTimeout(() => {
            this.formError = false;
            this.cdr.detectChanges();
          }, 5000);
        },
      });
      return;
    }

    // Fallback: mailto link if no endpoint configured
    const email = this.contact.email || 'contact@isoatthetop.com';
    const subject =
      this.locale === 'fr' ? 'Demande de séjour – Iso At The Top' : 'Stay request – Iso At The Top';

    const formData = new FormData(form);
    const lines: string[] = [];
    for (const [key, value] of formData.entries()) {
      if (!value) continue;
      lines.push(`${key}: ${value}`);
    }

    const body = encodeURIComponent(lines.join('\n'));
    const url = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${body}`;
    window.location.href = url;
  }

  protected otherLocaleHref(targetLocale: Locale): string {
    const rawBase = document.querySelector('base')?.getAttribute('href') ?? '/';
    const basePath = rawBase.startsWith('http') ? new URL(rawBase).pathname : rawBase;
    const normalizedBase = basePath.endsWith('/') ? basePath : `${basePath}/`;

    const match = normalizedBase.match(/^(.*\/)(en|fr)\/$/);
    const siteRoot = match ? match[1] : normalizedBase;

    const segment = seasonRouteSegment(targetLocale, this.season);
    return `${siteRoot}${targetLocale}/${segment}/`;
  }

  protected heroImageSrc(): string {
    return this.season === 'winter' ? 'media/hiver/vue_hiver.jpg' : 'media/ete/vue_été.JPG';
  }

  private updateSeoTags(): void {
    const baseUrl = 'https://www.isoatthetop.com';
    
    // Remove any existing JSON-LD scripts
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach(script => script.remove());
    
    // Titles and descriptions per season and locale
    const seoData = {
      winter: {
        fr: {
          title: 'Appartement Isola 2000 - Location Ski Pied des Pistes | Iso At The Top',
          description: 'Appartement rénové 50 m² à Isola 2000 : 2 chambres, 2 salles d\'eau, vue panoramique sud. À ~250 m des pistes. Location ski hiver dans les Alpes-Maritimes.',
          ogImage: 'media/hiver/vue_hiver.jpg',
        },
        en: {
          title: 'Isola 2000 Apartment - Ski-in Ski-out Rental | Iso At The Top',
          description: 'Renovated 50 m² apartment in Isola 2000: 2 bedrooms, 2 bathrooms, south-facing with panoramic views. ~250 m from slopes. Winter ski rental in French Alps.',
          ogImage: 'media/hiver/vue_hiver.jpg',
        },
      },
      summer: {
        fr: {
          title: 'Appartement Isola 2000 Été - Location Montagne | Iso At The Top',
          description: 'Location été à Isola 2000 : appartement rénové 50 m², 2 chambres, vue panoramique. Randonnées, VTT, activités montagne dans les Alpes du Sud.',
          ogImage: 'media/ete/vue_été.JPG',
        },
        en: {
          title: 'Isola 2000 Summer Apartment - Mountain Rental | Iso At The Top',
          description: 'Summer rental in Isola 2000: renovated 50 m² apartment, 2 bedrooms, panoramic views. Hiking, MTB, mountain activities in the French Southern Alps.',
          ogImage: 'media/ete/vue_été.JPG',
        },
      },
    };

    const currentSeo = seoData[this.season][this.locale];
    const currentUrl = `${baseUrl}/${this.locale}/${this.season === 'winter' ? (this.locale === 'fr' ? 'hiver' : 'winter') : (this.locale === 'fr' ? 'ete' : 'summer')}/`;
    const altLocale = this.locale === 'fr' ? 'en' : 'fr';
    const altUrl = `${baseUrl}/${altLocale}/${this.season === 'winter' ? (altLocale === 'fr' ? 'hiver' : 'winter') : (altLocale === 'fr' ? 'ete' : 'summer')}/`;
    const defaultUrl = `${baseUrl}/en/${this.season === 'winter' ? 'winter' : 'summer'}/`;

    // Update title
    this.titleService.setTitle(currentSeo.title);

    // Update meta description
    this.metaService.updateTag({ name: 'description', content: currentSeo.description });

    // Canonical URL
    this.metaService.updateTag({ rel: 'canonical', href: currentUrl });

    // Open Graph tags
    this.metaService.updateTag({ property: 'og:type', content: 'website' });
    this.metaService.updateTag({ property: 'og:title', content: currentSeo.title });
    this.metaService.updateTag({ property: 'og:description', content: currentSeo.description });
    this.metaService.updateTag({ property: 'og:image', content: `${baseUrl}/${currentSeo.ogImage}` });
    this.metaService.updateTag({ property: 'og:url', content: currentUrl });
    this.metaService.updateTag({ property: 'og:locale', content: this.locale === 'fr' ? 'fr_FR' : 'en_US' });
    this.metaService.updateTag({ property: 'og:site_name', content: 'Iso At The Top' });

    // Twitter Card tags
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: currentSeo.title });
    this.metaService.updateTag({ name: 'twitter:description', content: currentSeo.description });
    this.metaService.updateTag({ name: 'twitter:image', content: `${baseUrl}/${currentSeo.ogImage}` });

    // Hreflang tags
    // Remove existing hreflang tags first
    const existingHreflangTags = this.metaService.getTags('rel="alternate"');
    existingHreflangTags.forEach((tag: HTMLMetaElement) => this.metaService.removeTagElement(tag));

    // Add new hreflang tags
    this.metaService.addTag({ rel: 'alternate', hreflang: this.locale, href: currentUrl });
    this.metaService.addTag({ rel: 'alternate', hreflang: altLocale, href: altUrl });
    this.metaService.addTag({ rel: 'alternate', hreflang: 'x-default', href: defaultUrl });

    // Add Schema.org JSON-LD structured data
    this.addStructuredData(currentUrl, currentSeo);
  }

  private addStructuredData(url: string, seoData: { title: string; description: string; ogImage: string }): void {
    const baseUrl = 'https://www.isoatthetop.com';
    
    // Build reviews array
    const reviewsArray = this.reviews.reviews?.slice(0, 3).map((review) => ({
      '@type': 'Review',
      'reviewRating': {
        '@type': 'Rating',
        'ratingValue': '5',
        'bestRating': '5'
      },
      'author': {
        '@type': 'Person',
        'name': 'Airbnb Guest'
      },
      'reviewBody': this.reviewExcerpt(review),
      'datePublished': review.date || new Date().toISOString().split('T')[0]
    })) || [];

    // Create VacationRental schema
    const vacationRentalSchema = {
      '@context': 'https://schema.org',
      '@type': 'VacationRental',
      'name': this.contact.brandName || 'Iso At The Top',
      'description': seoData.description,
      'url': url,
      'image': `${baseUrl}/${seoData.ogImage}`,
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': 'Isola 2000',
        'addressRegion': 'Alpes-Maritimes',
        'addressCountry': 'FR',
        'postalCode': '06420'
      },
      'geo': {
        '@type': 'GeoCoordinates',
        'latitude': '44.1844',
        'longitude': '7.1575'
      },
      'numberOfRooms': 3,
      'numberOfBedrooms': 2,
      'numberOfBathroomsTotal': 2,
      'floorSize': {
        '@type': 'QuantitativeValue',
        'value': '50',
        'unitCode': 'MTK'
      },
      'petsAllowed': false,
      'amenityFeature': [
        { '@type': 'LocationFeatureSpecification', 'name': this.locale === 'fr' ? 'Cuisine équipée' : 'Equipped kitchen', 'value': true },
        { '@type': 'LocationFeatureSpecification', 'name': this.locale === 'fr' ? 'Balcon sud' : 'South-facing balcony', 'value': true },
        { '@type': 'LocationFeatureSpecification', 'name': this.locale === 'fr' ? 'Vue panoramique' : 'Panoramic views', 'value': true },
        { '@type': 'LocationFeatureSpecification', 'name': 'WiFi', 'value': true }
      ],
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': '5.0',
        'bestRating': '5',
        'worstRating': '1',
        'ratingCount': this.reviews.reviews?.length || 3
      },
      'review': reviewsArray
    };

    // Create Organization schema for brand
    const organizationSchema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': this.contact.brandName || 'Iso At The Top',
      'url': baseUrl,
      'logo': `${baseUrl}/media/logo.png`,
      'contactPoint': {
        '@type': 'ContactPoint',
        'contactType': 'customer service',
        'email': this.contact.email || 'contact@isoatthetop.com',
        'availableLanguage': ['fr', 'en']
      }
    };

    // Inject both schemas
    this.injectJsonLd(vacationRentalSchema);
    this.injectJsonLd(organizationSchema);
  }

  private injectJsonLd(schema: any): void {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
  }
}
