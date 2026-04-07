import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'default' | 'midnight';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly KEY = 'pod-theme';

  readonly isDark = signal<boolean>(localStorage.getItem(this.KEY) === 'midnight');

  constructor() {
    effect(() => {
      const theme = this.isDark() ? 'midnight' : 'default';
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem(this.KEY, theme);
    });
  }

  toggle(): void {
    this.isDark.update(v => !v);
  }
}
