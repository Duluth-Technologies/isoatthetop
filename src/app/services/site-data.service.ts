import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SiteDataService {
  private readonly cache = new Map<string, Observable<unknown>>();

  constructor(private readonly http: HttpClient) {}

  getJson<T>(assetPath: string): Observable<T> {
    const cached = this.cache.get(assetPath);
    if (cached) return cached as Observable<T>;

    const request$ = this.http.get<T>(assetPath).pipe(shareReplay({ bufferSize: 1, refCount: false }));
    this.cache.set(assetPath, request$ as Observable<unknown>);
    return request$;
  }
}

