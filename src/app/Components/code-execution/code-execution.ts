import { Component, OnInit, OnDestroy, ChangeDetectorRef, HostListener } from '@angular/core';
import { CodeExecutionService } from '../../Services/code-execution-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BASE_URL } from '../../../Environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-code-runner',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './code-execution.html',
  styleUrls: ['./code-execution.css']
})
export class CodeExecution implements OnInit, OnDestroy {

  // --- UI & State Variables ---
  activeTab: 'problem' | 'code' | 'output' = 'problem';
  isProcessing: boolean = false; 
  toastMessage: string = '';
  toastType: 'success' | 'error' | 'info' | 'warning' = 'info';

  // --- Problem Data ---
  code: string = '';
  language: string = 'JAVA';
  output: string = '';
  title: string = 'Loading Problem...';
  description: string = '';
  input: string = '';
  expectedOutput = '';
  testCases: any[] = [];
  marks: number = 0;

  // --- Config & IDs ---
  languages = ['JAVA', 'PYTHON', 'CPP'];
  problemId: number = Number(localStorage.getItem("ProblemId"));
  userId: number = Number(localStorage.getItem('UserId'));

  // --- Timer & Anti-Cheat Logic ---
  minutes: number = 0;
  seconds: number = 0;
  intervalId: any;
  readonly EXAM_DURATION_MIN = 30; 
  cheatingCount: number = 0; 
  readonly MAX_CHEATING_LIMIT = 3;

  // --- Storage Keys ---
  private readonly TIMER_KEY = `ExamEndTime_P${this.problemId}_U${this.userId}`;
  private readonly CHEAT_KEY = `CheatCount_P${this.problemId}_U${this.userId}`;
  private readonly REFRESH_FLAG = `HasRefreshed_P${this.problemId}`;

  constructor(
    private api: CodeExecutionService,
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    private router: Router,
  ) { }

  // 1. REFRESH DETECTION: Increment cheat count BEFORE the page reloads
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.isProcessing) return;

    // Increment cheat count in storage immediately
    let currentCheats = Number(localStorage.getItem(this.CHEAT_KEY)) || 0;
    currentCheats++;
    localStorage.setItem(this.CHEAT_KEY, currentCheats.toString());
    
    // Set a flag so ngOnInit knows this reload was a cheating attempt
    localStorage.setItem(this.REFRESH_FLAG, "true");

    $event.returnValue = "Warning: Refreshing counts as a cheating attempt!";
  }

  // 2. TAB SWITCH DETECTION
  @HostListener('document:visibilitychange', [])
  onVisibilityChange() {
    if (document.hidden) {
      this.cheatingCount++;
      this.recordCheating("Tab Switch");
    }
  }

  // 3. FOCUS DETECTION (Alt+Tab)
  @HostListener('window:blur', [])
  onWindowBlur() {
    this.cheatingCount++;
    this.recordCheating("Focus Lost");
  }

  // 4. BLOCK COPY-PASTE
  @HostListener('window:copy', ['$event'])
  @HostListener('window:paste', ['$event'])
  blockCopyPaste(event: any) {
    event.preventDefault();
    this.showToast("Copy/Paste is blocked!", "warning");
  }

  ngOnInit(): void {
    if (!this.problemId || !this.userId) {
      this.showToast("Session Error! Redirecting...", "error");
      this.router.navigate(["/student"]);
      return;
    }

    // --- ANTI-CHEAT RESTORE ---
    const savedCheats = localStorage.getItem(this.CHEAT_KEY);
    this.cheatingCount = savedCheats ? Number(savedCheats) : 0;

    if (localStorage.getItem(this.REFRESH_FLAG) === "true") {
      localStorage.removeItem(this.REFRESH_FLAG); 
      this.recordCheating("Page Refresh"); 
    }

    // --- TIMER RESTORE ---
    this.initPersistentTimer();

    this.fetchProblemData();
    this.fetchTestCases();
  }

  // --- TIMER PERSISTENCE ---
  private initPersistentTimer() {
    let savedEndTime = localStorage.getItem(this.TIMER_KEY);
    const now = Date.now();

    if (savedEndTime) {
      const endTime = Number(savedEndTime);
      if (endTime > now) {
        this.runTimer(endTime);
      } else {
        this.submitCode(true);
      }
    } else {
      const newEndTime = now + (this.EXAM_DURATION_MIN * 60 * 1000);
      localStorage.setItem(this.TIMER_KEY, newEndTime.toString());
      this.runTimer(newEndTime);
    }
  }

  private runTimer(targetEndTime: number) {
    if (this.intervalId) clearInterval(this.intervalId);

    this.intervalId = setInterval(() => {
      const now = Date.now();
      const remainingTimeMs = targetEndTime - now;

      if (remainingTimeMs <= 0) {
        clearInterval(this.intervalId);
        this.minutes = 0;
        this.seconds = 0;
        this.showToast("⏰ Time's up!", "warning");
        this.submitCode(true); 
        return;
      }

      this.minutes = Math.floor(remainingTimeMs / 60000);
      this.seconds = Math.floor((remainingTimeMs % 60000) / 1000);
      this.cdr.detectChanges(); 
    }, 1000);
  }

  private recordCheating(reason: string) {
    if (this.isProcessing) return;

    localStorage.setItem(this.CHEAT_KEY, this.cheatingCount.toString());

    if (this.cheatingCount >= this.MAX_CHEATING_LIMIT) {
      this.showToast(`🚫 Limit reached! Auto-submitting due to ${reason}`, "error");
      setTimeout(() => this.submitCode(true), 1500);
    } else {
      const remaining = this.MAX_CHEATING_LIMIT - this.cheatingCount;
      this.showToast(`⚠️ Warning: ${reason} detected! Attempts left: ${remaining}`, "warning");
    }
    this.cdr.detectChanges();
  }

  // --- API CALLS ---
  fetchProblemData() {
    this.http.get(`${BASE_URL}/api/code/getProblem/${this.problemId}`).subscribe({
      next: (data: any) => {
        this.title = data.title;
        this.description = data.problemStatement;
        this.cdr.detectChanges();
      },
      error: (err) => this.handleApiError(err, "Problem")
    });
  }

  fetchTestCases() {
    this.http.get(`${BASE_URL}/api/code/getTestCases/${this.problemId}`).subscribe({
      next: (data: any) => {
        this.testCases = data;
        if (data.length > 0) {
          this.input = data[0].inputData;
          this.expectedOutput = data[0].expectedOutput;
        }
        this.cdr.detectChanges();
      },
      error: (err) => this.handleApiError(err, "TestCases")
    });
  }

  runCode() {
    if (!this.code.trim()) {
      this.showToast("Please write code first!", "info");
      return;
    }
    this.isProcessing = true;
    this.output = 'Running...';
    this.api.runCode(this.code, this.language, this.problemId).subscribe({
      next: (res: any) => {
        this.isProcessing = false;
        let data = typeof res === 'string' ? JSON.parse(res) : res;
        this.output = data.testCases?.join('\n') || data.output || 'No output.';
        this.marks = data.testCases ? (data.marks / data.testCases.length) * 100 : 0;
        this.cdr.detectChanges();
      },
      error: (err) => this.handleApiError(err, "Execution")
    });
  }

  // --- SUBMISSION ---
  submitCode(isAutoSubmit: boolean = false) {
    if (this.isProcessing && !isAutoSubmit) return;
    this.isProcessing = true;
    if (this.intervalId) clearInterval(this.intervalId);

    const body = {
      marks: this.marks,
      takenTime: this.calculateUsedTime(),
      userId: this.userId,
      problemId: this.problemId
    };

    this.http.post(`${BASE_URL}/api/student/SaveStudentCodeInfo/${this.userId}/${this.problemId}`, body, { responseType: 'text' })
      .subscribe({
        next: () => {
          this.cleanupExamData(); // Cleans Storage on Success
          this.showToast("🚀 Submitted Successfully!", "success");
          setTimeout(() => this.router.navigate(['/student']), 2000);
         
        },
        error: (err) => {
          this.isProcessing = false;
          this.showToast("Submission Failed!", "error");
        }
      });
  }

  private calculateUsedTime(): string {
    const endTime = Number(localStorage.getItem(this.TIMER_KEY));
    if (!endTime) return "00:00";
    
    const totalMs = this.EXAM_DURATION_MIN * 60 * 1000;
    const remainingMs = Math.max(0, endTime - Date.now());
    const usedMs = totalMs - remainingMs;

    const usedMin = Math.floor(usedMs / 60000);
    const usedSec = Math.floor((usedMs % 60000) / 1000);
    return `${usedMin.toString().padStart(2, '0')}:${usedSec.toString().padStart(2, '0')}`;
  }

  private handleEmergencySubmit() {
    const url = `${BASE_URL}/api/student/SaveStudentCodeInfo/${this.userId}/${this.problemId}`;
    const body = JSON.stringify({
      marks: this.marks,
      takenTime: this.calculateUsedTime(),
      userId: this.userId,
      problemId: this.problemId
    });
    const blob = new Blob([body], { type: 'application/json' });
    navigator.sendBeacon(url, blob);
    this.cleanupExamData();
  }

  // --- COMPLETE STORAGE CLEANUP ---
  private cleanupExamData() {
    localStorage.removeItem(this.TIMER_KEY);
    localStorage.removeItem(this.CHEAT_KEY);
    localStorage.removeItem(this.REFRESH_FLAG);
    localStorage.removeItem("ProblemId");
    // We keep UserId and JWT_TOKEN so the user stays logged in
  }

  private handleApiError(err: HttpErrorResponse, context: string) {
    this.isProcessing = false;
    this.showToast(`Error: ${err.status}`, "error");
    this.cdr.detectChanges();
  }

  showToast(msg: string, type: any = 'info') {
    this.toastMessage = msg; this.toastType = type; this.cdr.detectChanges();
    setTimeout(() => { this.toastMessage = ''; this.cdr.detectChanges(); }, 4000);
  }

  ngOnDestroy() { if (this.intervalId) clearInterval(this.intervalId); }
}