import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../Services/theme.service';

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Sidebar variant (default) -->
    <button
      *ngIf="variant === 'sidebar'"
      class="theme-toggle sidebar-toggle"
      (click)="ts.toggle()"
      [title]="ts.isDark() ? 'Switch to Light' : 'Switch to Dark'">
      <span class="toggle-track" [class.dark]="ts.isDark()">
        <span class="toggle-thumb"></span>
      </span>
      <span class="toggle-label">{{ ts.isDark() ? '🌙 Dark' : '☀️ Light' }}</span>
    </button>

    <!-- Floating variant (for auth pages) -->
    <button
      *ngIf="variant === 'float'"
      class="theme-toggle float-toggle"
      (click)="ts.toggle()"
      [title]="ts.isDark() ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
      <span class="float-icon">{{ ts.isDark() ? '☀️' : '🌙' }}</span>
      <span class="float-label">{{ ts.isDark() ? 'Light' : 'Dark' }}</span>
    </button>

    <!-- Icon-only variant -->
    <button
      *ngIf="variant === 'icon'"
      class="theme-toggle icon-toggle"
      (click)="ts.toggle()"
      [title]="ts.isDark() ? 'Switch to Light' : 'Switch to Dark'">
      <span>{{ ts.isDark() ? '☀️' : '🌙' }}</span>
    </button>
  `,
  styles: [`
    /* ── Sidebar toggle ── */
    .sidebar-toggle {
      display: flex;
      align-items: center;
      gap: 10px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px 12px;
      border-radius: 10px;
      width: 100%;
      transition: background 0.2s;
    }
    .sidebar-toggle:hover { background: var(--color-bg-hover); }

    .toggle-track {
      width: 38px;
      height: 22px;
      border-radius: 999px;
      background: var(--color-border);
      position: relative;
      transition: background 0.25s;
      flex-shrink: 0;
      border: 1px solid var(--glass-border);
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
      transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
      box-shadow: 0 1px 4px rgba(0,0,0,0.3);
    }
    .toggle-track.dark .toggle-thumb { transform: translateX(16px); }

    .toggle-label {
      font-size: 13px;
      color: var(--color-text-secondary);
      font-weight: 600;
    }

    /* ── Float toggle (auth pages) ── */
    .float-toggle {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--glass-bg-strong);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      border: 1px solid var(--glass-border-strong);
      border-radius: 999px;
      padding: 8px 16px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      color: var(--color-text-secondary);
      transition: all 0.2s ease;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
    }

    .float-toggle:hover {
      background: var(--color-primary-soft);
      border-color: var(--color-primary-ring);
      color: var(--color-primary);
      transform: translateY(-1px);
      box-shadow: 0 8px 24px rgba(129, 140, 248, 0.25);
    }

    .float-icon { font-size: 16px; }
    .float-label { font-size: 12px; font-weight: 700; letter-spacing: 0.04em; }

    /* ── Icon-only toggle ── */
    .icon-toggle {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background: var(--glass-bg);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      border: 1px solid var(--glass-border);
      border-radius: 10px;
      cursor: pointer;
      font-size: 16px;
      transition: all 0.2s ease;
    }

    .icon-toggle:hover {
      background: var(--color-primary-soft);
      border-color: var(--color-primary-ring);
      transform: rotate(20deg) scale(1.1);
    }
  `]
})
export class ThemeSwitcher {
  readonly ts = inject(ThemeService);

  /** 'sidebar' | 'float' | 'icon' */
  @Input() variant: 'sidebar' | 'float' | 'icon' = 'sidebar';
}
