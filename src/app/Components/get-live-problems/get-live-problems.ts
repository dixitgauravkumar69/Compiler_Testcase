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
   UserId!:Number;

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
    this.UserId=Number(localStorage.getItem("UserId"));


    if (stored) {
      this.attemptedIds = stored.split(',');
    }
    this.startInitialPolling();
    this.startCountdown();
  }

  // --- Core Time Conversion Helper (The Fix) ---
  
  /**
   * Backend (UTC) string ko Local (IST) Date object mein convert karta hai.
   * Agar string "2026-03-20T11:17" jaisi hai, toh ye automatically 'Z' add karega
   * taaki browser use UTC maane aur IST (+5:30) mein convert kare.
   */
  private toLocalTime(utcDateString: string): Date {
    if (!utcDateString) return new Date();
    
    let formattedStr = utcDateString;
    // Check if timezone indicator is missing, then append 'Z' for UTC
    if (!formattedStr.endsWith('Z') && !formattedStr.includes('+')) {
      formattedStr += 'Z';
    }
    
    return new Date(formattedStr);
  }

  getUniqueKey(ps: any): string {
    return `${ps.id}_${ps.startTime}`;
  }

  startCountdown() {
    this.countdownTimer = setInterval(() => {
      this.cdr.detectChanges(); 
    }, 1000);
  }

  isAttempted(ps: any): boolean {
    const key = this.getUniqueKey(ps);
    return this.attemptedIds.includes(key);
  }

  attempt(ps: any) {
    if (this.isAttempted(ps)) return;
    const key = this.getUniqueKey(ps);
    this.attemptedIds.push(key);
    localStorage.setItem("attemptedIds", this.attemptedIds.join(','));
    localStorage.setItem("ProblemId", `${ps.id}`);
    this.router.navigate(['/Run']);
  }

  // --- API & Polling Logic ---

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


  
  getLiveProblems() {
    if (this.problemStatements.length === 0) this.isLoading = true;
    this.http.get<any[]>(`${BASE_URL}/student/getLiveStream/${this.UserId}`, { withCredentials: true })
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
        error: (err) => {
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

  stopInitialTimer() {
    if (this.initialFetchTimer) { clearInterval(this.initialFetchTimer); this.initialFetchTimer = null; }
  }

  stopStatusTimer() {
    if (this.statusUpdateTimer) { clearInterval(this.statusUpdateTimer); this.statusUpdateTimer = null; }
  }

  ngOnDestroy() {
    this.stopInitialTimer();
    this.stopStatusTimer();
    if (this.countdownTimer) clearInterval(this.countdownTimer);
  }

  // --- Time Helpers (Synced with IST) ---

  isPastTime(endTime: any): boolean { 
    return new Date() > this.toLocalTime(endTime); 
  }

  isFutureTime(startTime: any): boolean { 
    return new Date() < this.toLocalTime(startTime); 
  }

  isCurrentlyLive(ps: any): boolean {
    const now = new Date();
    const start = this.toLocalTime(ps.startTime);
    const end = this.toLocalTime(ps.endTime);
    return now >= start && now <= end;
  }

  getRemainingTime(endTime: string): string {
    const end = this.toLocalTime(endTime).getTime();
    const now = new Date().getTime();
    const diff = end - now;

    if (diff <= 0) return 'Ended';

    const hrs = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);

    // Formatted strings: e.g., "05:08" instead of "5:8"
    const displayMins = mins < 10 ? `0${mins}` : mins;
    const displaySecs = secs < 10 ? `0${secs}` : secs;

    if (hrs > 0) {
      return `${hrs}h ${displayMins}m`;
    }
    return `${displayMins}:${displaySecs}`;
  }
}