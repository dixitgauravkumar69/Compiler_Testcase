import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../Services/theme.service';

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button class="theme-toggle" (click)="ts.toggle()" [title]="ts.isDark() ? 'Switch to Light' : 'Switch to Dark'">
      <span class="toggle-track" [class.dark]="ts.isDark()">
        <span class="toggle-thumb"></span>
      </span>
      <span class="toggle-label">{{ ts.isDark() ? '🌙' : '☀️' }}</span>
    </button>
  `,
  styles: [`
    .theme-toggle {
      display: flex;
      align-items: center;
      gap: 8px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 6px 10px;
      border-radius: 8px;
      width: 100%;
      transition: background 0.2s;
    }
    .theme-toggle:hover { background: var(--color-bg-hover); }

    .toggle-track {
      width: 36px;
      height: 20px;
      border-radius: 999px;
      background: var(--color-border);
      position: relative;
      transition: background 0.25s;
      flex-shrink: 0;
    }
    .toggle-track.dark { background: var(--color-primary); }

    .toggle-thumb {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #fff;
      transition: transform 0.25s;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    }
    .toggle-track.dark .toggle-thumb { transform: translateX(16px); }

    .toggle-label { font-size: 14px; color: var(--color-text-secondary); font-weight: 600; }
  `]
})
export class ThemeSwitcher {
  readonly ts = inject(ThemeService);
}
