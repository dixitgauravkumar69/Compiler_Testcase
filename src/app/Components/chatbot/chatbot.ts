import {
  Component,
  signal,
  ElementRef,
  ViewChild,
  AfterViewChecked,
  OnDestroy,
  inject,
  HostListener,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../Services/theme.service';

interface Message {
  role: 'user' | 'bot';
  text: string;
  loading?: boolean;
}

const POSITION_KEY = 'chatbot-fab-position';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.html',
  styleUrl: './chatbot.css',
})
export class ChatbotComponent implements AfterViewChecked, OnDestroy {
  @ViewChild('messagesContainer') private readonly messagesContainer!: ElementRef;

  readonly ts = inject(ThemeService);

  isOpen = signal(false);
  userInput = '';
  messages = signal<Message[]>([
    {
      role: 'bot',
      text: "Hi there! 👋 Ask me anything and I'll help you out.",
    },
  ]);

  // ── Drag state ──
  fabX = signal<number | null>(null);
  fabY = signal<number | null>(null);
  private isDragging = false;
  private dragOffsetX = 0;
  private dragOffsetY = 0;
  private dragMoved = false;

  private shouldScroll = false;

  constructor(private readonly http: HttpClient) {
    this.loadSavedPosition();
  }

  // ── Lifecycle ──

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  ngOnDestroy(): void {
    this.removeDragListeners();
  }

  // ── Chat ──

  toggleChat(): void {
    if (this.dragMoved) return; // don't open/close if user was dragging
    this.isOpen.update((v) => !v);
    if (this.isOpen()) {
      this.shouldScroll = true;
    }
  }

  sendMessage(): void {
    const question = this.userInput.trim();
    if (!question) return;

    this.messages.update((msgs) => [...msgs, { role: 'user', text: question }]);
    this.userInput = '';
    this.shouldScroll = true;

    this.messages.update((msgs) => [
      ...msgs,
      { role: 'bot', text: '', loading: true },
    ]);
    this.shouldScroll = true;

    this.http
      .post<{ answer: string }>(
        'http://localhost:8080/api/User/request-reply',
        question,
        { headers: { 'Content-Type': 'text/plain' } }
      )
      .subscribe({
        next: (res) => {
          const answer = res.answer ?? 'No response received.';
          this.messages.update((msgs) => {
            const updated = [...msgs];
            const idx = this.findLoadingIndex(updated);
            if (idx !== -1) updated[idx] = { role: 'bot', text: answer };
            return updated;
          });
          this.shouldScroll = true;
        },
        error: () => {
          this.messages.update((msgs) => {
            const updated = [...msgs];
            const idx = this.findLoadingIndex(updated);
            if (idx !== -1)
              updated[idx] = {
                role: 'bot',
                text: '⚠️ Something went wrong. Please try again.',
              };
            return updated;
          });
          this.shouldScroll = true;
        },
      });
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  // ── Drag ──

  onFabPointerDown(event: PointerEvent): void {
    // Only primary button (left click / touch)
    if (event.button !== 0 && event.pointerType === 'mouse') return;

    this.isDragging = true;
    this.dragMoved = false;

    const el = (event.currentTarget as HTMLElement);
    el.setPointerCapture(event.pointerId);

    const rect = el.getBoundingClientRect();
    this.dragOffsetX = event.clientX - rect.left;
    this.dragOffsetY = event.clientY - rect.top;

    event.preventDefault();
  }

  onFabPointerMove(event: PointerEvent): void {
    if (!this.isDragging) return;

    const fabSize = 58;
    const margin = 8;
    const maxX = window.innerWidth - fabSize - margin;
    const maxY = window.innerHeight - fabSize - margin;

    let newX = event.clientX - this.dragOffsetX;
    let newY = event.clientY - this.dragOffsetY;

    newX = Math.max(margin, Math.min(newX, maxX));
    newY = Math.max(margin, Math.min(newY, maxY));

    // Only mark as moved if actually dragged a few pixels
    const dx = Math.abs(newX - (this.fabX() ?? (window.innerWidth - 58 - 28)));
    const dy = Math.abs(newY - (this.fabY() ?? (window.innerHeight - 58 - 28)));
    if (dx > 4 || dy > 4) this.dragMoved = true;

    this.fabX.set(newX);
    this.fabY.set(newY);
  }

  onFabPointerUp(event: PointerEvent): void {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.savePosition();

    // Reset dragMoved after a tick so click handler can check it
    setTimeout(() => { this.dragMoved = false; }, 0);
  }

  // ── Helpers ──

  get fabStyle(): Record<string, string> {
    const x = this.fabX();
    const y = this.fabY();
    if (x === null || y === null) return {};
    return {
      left: `${x}px`,
      top: `${y}px`,
      right: 'auto',
      bottom: 'auto',
    };
  }

  get chatWindowStyle(): Record<string, string> {
    const x = this.fabX();
    const y = this.fabY();
    if (x === null || y === null) return {};

    const fabSize = 58;
    const windowWidth = 360;
    const windowHeight = 520;
    const gap = 12;

    // Position window above the FAB
    let winLeft = x;
    let winTop = y - windowHeight - gap;

    // Clamp horizontally
    if (winLeft + windowWidth > window.innerWidth - 8) {
      winLeft = window.innerWidth - windowWidth - 8;
    }
    if (winLeft < 8) winLeft = 8;

    // If not enough space above, show below
    if (winTop < 8) winTop = y + fabSize + gap;

    return {
      left: `${winLeft}px`,
      top: `${winTop}px`,
      right: 'auto',
      bottom: 'auto',
    };
  }

  private findLoadingIndex(msgs: Message[]): number {
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].loading) return i;
    }
    return -1;
  }

  private scrollToBottom(): void {
    try {
      const el = this.messagesContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }

  private savePosition(): void {
    const x = this.fabX();
    const y = this.fabY();
    if (x !== null && y !== null) {
      localStorage.setItem(POSITION_KEY, JSON.stringify({ x, y }));
    }
  }

  private loadSavedPosition(): void {
    try {
      const saved = localStorage.getItem(POSITION_KEY);
      if (saved) {
        const { x, y } = JSON.parse(saved);
        this.fabX.set(x);
        this.fabY.set(y);
      }
    } catch {}
  }

  private removeDragListeners(): void {
    // Pointer capture handles cleanup automatically
  }
}
