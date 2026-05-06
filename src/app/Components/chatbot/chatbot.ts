import { Component, signal, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Message {
  role: 'user' | 'bot';
  text: string;
  loading?: boolean;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.html',
  styleUrl: './chatbot.css',
})
export class ChatbotComponent implements AfterViewChecked {
  @ViewChild('messagesContainer') private readonly messagesContainer!: ElementRef;

  isOpen = signal(false);
  userInput = '';
  messages = signal<Message[]>([
    {
      role: 'bot',
      text: 'Hi there! 👋 Ask me anything and I\'ll help you out.',
    },
  ]);

  private shouldScroll = false;

  constructor(private readonly http: HttpClient) {}

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  toggleChat(): void {
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

    // Add loading placeholder
    this.messages.update((msgs) => [
      ...msgs,
      { role: 'bot', text: '', loading: true },
    ]);
    this.shouldScroll = true;

    this.http
      .post<{ answer: string }>('http://localhost:8080/api/User/request-reply', question, {
        headers: { 'Content-Type': 'text/plain' },
      })
      .subscribe({
        next: (res) => {
          const answer = res.answer ?? 'No response received.';
          this.messages.update((msgs) => {
            const updated = [...msgs];
            let loadingIdx = -1;
            for (let i = updated.length - 1; i >= 0; i--) {
              if (updated[i].loading) { loadingIdx = i; break; }
            }
            if (loadingIdx !== -1) {
              updated[loadingIdx] = { role: 'bot', text: answer };
            }
            return updated;
          });
          this.shouldScroll = true;
        },
        error: () => {
          this.messages.update((msgs) => {
            const updated = [...msgs];
            let loadingIdx = -1;
            for (let i = updated.length - 1; i >= 0; i--) {
              if (updated[i].loading) { loadingIdx = i; break; }
            }
            if (loadingIdx !== -1) {
              updated[loadingIdx] = {
                role: 'bot',
                text: '⚠️ Something went wrong. Please try again.',
              };
            }
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

  private scrollToBottom(): void {
    try {
      const el = this.messagesContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }
}
