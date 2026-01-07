import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="container" style="padding: 60px 0;">
      <h1 style="margin: 0 0 10px;" i18n="@@notFoundTitle">404</h1>
      <p class="muted" style="margin: 0 0 16px;" i18n="@@notFoundText">Page not found.</p>
      <a class="btn btn-primary" routerLink="/" i18n="@@notFoundHome">Back to home</a>
    </main>
  `,
})
export class NotFoundPage {}
