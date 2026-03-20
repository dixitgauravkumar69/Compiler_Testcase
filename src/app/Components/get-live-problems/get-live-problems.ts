import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BASE_URL } from '../../../Environments/environment';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-get-live-problems',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './get-live-problems.html',
  styleUrls: ['./get-live-problems.css'],
})
export class GetLiveProblems implements OnInit, OnDestroy {

  problemStatements: any[] = [];
  isLoading: boolean = false;
  errorMsg: string = '';

  attemptedIds: string[] = [];

  private initialFetchTimer: any;
  private statusUpdateTimer: any;
  private countdownTimer: any;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    const stored = localStorage.getItem("attemptedIds");
    if (stored) {
      this.attemptedIds = stored.split(',');
    }

    this.startInitialPolling();
    this.startCountdown();
  }

  // =========================
  //  UTC HELPERS
  // =========================
  getUTCDate(date: any): Date {
    return new Date(date); // backend UTC ISO handled
  }

  getNowUTC(): Date {
    return new Date(); // always UTC base internally
  }

  // =========================
  // UNIQUE KEY
  // =========================
  getUniqueKey(ps: any): string {
    return `${ps.id}_${ps.startTime}`;
  }

  isAttempted(ps: any): boolean {
    return this.attemptedIds.includes(this.getUniqueKey(ps));
  }

  attempt(ps: any) {
    if (this.isAttempted(ps)) return;

    const key = this.getUniqueKey(ps);
    this.attemptedIds.push(key);

    localStorage.setItem("attemptedIds", this.attemptedIds.join(','));
    localStorage.setItem("ProblemId", `${ps.id}`);

    this.router.navigate(['/Run']);
  }

  // =========================
  // TIMERS
  // =========================
  startCountdown() {
    this.countdownTimer = setInterval(() => {
      this.cdr.detectChanges();
    }, 1000);
  }

  startInitialPolling() {
    this.getLiveProblems();

    this.initialFetchTimer = setInterval(() => {
      if (this.problemStatements.length === 0) {
        this.getLiveProblems();
      }
    }, 5000);
  }

  startStatusSync() {
    this.statusUpdateTimer = setInterval(() => {
      this.syncStatusOnly();
    }, 10000);
  }

  stopInitialTimer() {
    if (this.initialFetchTimer) {
      clearInterval(this.initialFetchTimer);
      this.initialFetchTimer = null;
    }
  }

  stopStatusTimer() {
    if (this.statusUpdateTimer) {
      clearInterval(this.statusUpdateTimer);
      this.statusUpdateTimer = null;
    }
  }

  ngOnDestroy() {
    this.stopInitialTimer();
    this.stopStatusTimer();

    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }
  }

  // =========================
  // API CALLS
  // =========================
  getLiveProblems() {
    if (this.problemStatements.length === 0) this.isLoading = true;

    this.http.get<any[]>(`${BASE_URL}/student/getLiveStream`, { withCredentials: true })
      .subscribe({
        next: (res) => {
          this.problemStatements = res || [];
          this.isLoading = false;

          this.cdr.detectChanges();

          if (this.problemStatements.length > 0) {
            this.stopInitialTimer();
            this.startStatusSync();
          }
        },
        error: () => {
          this.isLoading = false;
          this.errorMsg = "Reconnecting to server...";
          this.cdr.detectChanges();
        }
      });
  }

  syncStatusOnly() {
    this.http.get<any[]>(`${BASE_URL}/student/getLiveStream`, { withCredentials: true })
      .subscribe({
        next: (res) => {
          if (res && res.length > 0) {
            this.problemStatements = res;
          } else {
            this.problemStatements = this.problemStatements.map(ps => ({
              ...ps,
              isLive: false
            }));
          }

          this.cdr.detectChanges();
        },
        error: (err) => console.error("Sync error:", err)
      });
  }

  // =========================
  //  TIME LOGIC (UTC SAFE)
  // =========================
  isPastTime(endTime: any): boolean {
    return this.getNowUTC() > this.getUTCDate(endTime);
  }

  isFutureTime(startTime: any): boolean {
    return this.getNowUTC() < this.getUTCDate(startTime);
  }

  isCurrentlyLive(ps: any): boolean {
    const now = this.getNowUTC();
    return now >= this.getUTCDate(ps.startTime) &&
           now <= this.getUTCDate(ps.endTime);
  }

  getRemainingTime(endTime: string): string {
    const diff = this.getUTCDate(endTime).getTime() - this.getNowUTC().getTime();

    if (diff <= 0) return 'Ended';

    const hrs = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);

    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }

    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

}