import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'midnight' | 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly KEY = 'pod-theme';

  // Default to dark (midnight) — only switch to light if explicitly saved
  readonly isDark = signal<boolean>(localStorage.getItem(this.KEY) !== 'light');

  constructor() {
    effect(() => {
      const theme = this.isDark() ? 'midnight' : 'light';
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem(this.KEY, theme);
    });
  }

  toggle(): void {
    this.isDark.update(v => !v);
  }
}
