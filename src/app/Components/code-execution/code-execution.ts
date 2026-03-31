import { Component, OnInit, OnDestroy, ChangeDetectorRef, HostListener } from '@angular/core';
import { CodeExecutionService } from '../../Services/code-execution-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BASE_URL, BASE_URL_CCOMPLEXITY } from '../../../Environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-code-runner',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './code-execution.html',
  styleUrls: ['./code-execution.css'],
})
export class CodeExecution implements OnInit, OnDestroy {
  // 1. IDs FIRST (Top par initialization zaroori hai keys ke liye)
  problemId: number = Number(localStorage.getItem('ProblemId'));
  userId: number = Number(localStorage.getItem('UserId'));

  // 2. Keys using those IDs
  private readonly TIMER_KEY = `ExamEndTime_P${this.problemId}_U${this.userId}`;
  private readonly CHEAT_KEY = `CheatCount_P${this.problemId}_U${this.userId}`;
  private readonly REFRESH_FLAG = `HasRefreshed_P${this.problemId}`;

  // --- UI & State ---
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
  Marks: number = 0;
  complexity: string = 'There is no code';
  totalTestCases: number = 0;
  level: string = '';
  problemid!:number;

  // --- Config ---
  languages = ['JAVA', 'PYTHON', 'CPP']; // Plural for HTML loop

  // --- Anti-Cheat & Timer ---
  minutes: number = 0;
  seconds: number = 0;
  elapsedSeconds: number = 0; 
  intervalId: any;
  readonly EXAM_DURATION_MIN = 30;
  cheatingCount: number = 0;
  readonly MAX_CHEATING_LIMIT = 3;

  constructor(
    private api: CodeExecutionService,
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    private router: Router
  ) {}

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.isProcessing) return;
    let currentCheats = Number(localStorage.getItem(this.CHEAT_KEY)) || 0;
    currentCheats++;
    localStorage.setItem(this.CHEAT_KEY, currentCheats.toString());
    localStorage.setItem(this.REFRESH_FLAG, 'true');
    $event.returnValue = 'Warning: Refreshing counts as a cheating attempt!';
  }

  @HostListener('document:visibilitychange', [])
  onVisibilityChange() {
    if (document.hidden) {
      this.handleCheatDetection('Tab Switch');
    }
  }

  @HostListener('window:blur', [])
  onWindowBlur() {
    this.handleCheatDetection('Focus Lost (Alt+Tab)');
  }

  @HostListener('window:copy', ['$event'])
  @HostListener('window:paste', ['$event'])
  blockCopyPaste(event: any) {
    event.preventDefault();
    this.showToast('Copy/Paste is strictly blocked!', 'warning');
  }

  ngOnInit(): void {
    if (!this.problemId || !this.userId) {
      this.router.navigate(['/student']);
      return;
    }

    const savedCheats = localStorage.getItem(this.CHEAT_KEY);
    this.cheatingCount = savedCheats ? Number(savedCheats) : 0;

    if (localStorage.getItem(this.REFRESH_FLAG) === 'true') {
      localStorage.removeItem(this.REFRESH_FLAG);
      this.handleCheatDetection('Page Refresh');
    }

    this.initPersistentTimer();
    this.fetchProblemData();
    this.fetchTestCases();
  }

  private handleCheatDetection(reason: string) {
    this.cheatingCount++;
    localStorage.setItem(this.CHEAT_KEY, this.cheatingCount.toString());

    if (this.cheatingCount >= this.MAX_CHEATING_LIMIT) {
      this.showToast(`🚫 Limit reached! Auto-submitting due to ${reason}`, 'error');
      this.submitCode(true); 
    } else {
      const remaining = this.MAX_CHEATING_LIMIT - this.cheatingCount;
      this.showToast(`⚠️ Warning: ${reason} detected! Attempts left: ${remaining}`, 'warning');
    }
    this.cdr.detectChanges();
  }

  runCode() {
    if (!this.code.trim()) {
      this.showToast('Please write some code!', 'info');
      return;
    }
    this.isProcessing = true;
    this.output = 'Executing test cases...';

    this.api.runCode(this.code, this.language, this.problemId).subscribe({
      next: (res: any) => {
        this.isProcessing = false;
        let data = typeof res === 'string' ? JSON.parse(res) : res;
        this.output = data.testCases?.join('\n') || data.output || 'No output.';
        this.totalTestCases = data.testCases ? data.testCases.length : 0;

        if (this.totalTestCases > 0) {
          this.Marks = (data.marks) * 100;     
        } else {
          this.Marks = data.marks || 0;
        }

        if(this.Marks > 0) {
           this.getComplexity();
        } else {
          this.showToast("Code is not satisfied all cases...");
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isProcessing = false;
        this.output = "Error executing code. Please check syntax.";
        this.handleApiError(err, 'Execution');
      }
    });
  }

  getComplexity() {
    const payload = { code: this.code, language: this.language.toLowerCase() };
    this.http.post<{complexity: string}>(`${BASE_URL_CCOMPLEXITY}/analyze`, payload).subscribe({
      next: (res) => {
        this.complexity = res.complexity;
        this.showToast("Complexity:"+this.complexity);
        this.cdr.detectChanges();
      },
      error: () => {
        this.complexity = 'Analysis Failed';
        this.cdr.detectChanges();
      }
    });
  }

  submitCode(isAutoSubmit: boolean = false) {
    if (this.isProcessing && !isAutoSubmit) return;

    this.isProcessing = true;
    if (this.intervalId) clearInterval(this.intervalId);

    const submitData = {
      marks: this.Marks,
      takenTime: this.calculateUsedTime(), 
      userId: this.userId,
      problemId: this.problemId,
      complexity: this.complexity 
    };

    const url = `${BASE_URL}/api/student/SaveStudentCodeInfo/${this.userId}/${this.problemId}`;

    this.http.post(url, submitData, { responseType: 'text' }).subscribe({
      next: () => {
        this.isProcessing = false; 
        this.cleanupExamData();
        this.showToast(isAutoSubmit ? 'Auto-Submitted!' : '🚀 Submitted Successfully!', 'success');
        setTimeout(() => this.router.navigate(['/student']), 2000);
      },
      error: (err) => {
        this.isProcessing = false;
        this.showToast('Submission Failed!', 'error');
      }
    });
  }

  private initPersistentTimer() {
    let savedEndTime = localStorage.getItem(this.TIMER_KEY);
    const now = Date.now();
    if (savedEndTime) {
      const endTime = Number(savedEndTime);
      if (endTime > now) { this.runTimer(endTime); } 
      else { this.submitCode(true); }
    } else {
      const newEndTime = now + this.EXAM_DURATION_MIN * 60 * 1000;
      localStorage.setItem(this.TIMER_KEY, newEndTime.toString());
      this.runTimer(newEndTime);
    }
  }

  private runTimer(targetEndTime: number) {
    this.intervalId = setInterval(() => {
      const now = Date.now();
      const remainingTimeMs = targetEndTime - now;
      const totalDurationMs = this.EXAM_DURATION_MIN * 60 * 1000;
      this.elapsedSeconds = Math.floor((totalDurationMs - remainingTimeMs) / 1000);

      if (remainingTimeMs <= 0) {
        clearInterval(this.intervalId);
        this.submitCode(true);
        return;
      }
      this.minutes = Math.floor(remainingTimeMs / 60000);
      this.seconds = Math.floor((remainingTimeMs % 60000) / 1000);
      this.cdr.detectChanges();
    }, 1000);
  }

  private calculateUsedTime(): string {
    const m = Math.floor(this.elapsedSeconds / 60);
    const s = this.elapsedSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  private cleanupExamData() {
    localStorage.removeItem(this.TIMER_KEY);
    localStorage.removeItem(this.CHEAT_KEY);
    localStorage.removeItem(this.REFRESH_FLAG);
  }

  fetchProblemData() {
    this.http.get(`${BASE_URL}/api/code/getProblem/${this.problemId}`).subscribe({
      next: (data: any) => {
        this.problemId=data.id;
        this.title = data.title;
        this.description = data.problemStatement;
        this.level = data.level;
        this.cdr.detectChanges();
      }
    });
  }

  fetchTestCases() {
    this.http.get(`${BASE_URL}/api/code/getTestCases/${this.problemId}`).subscribe({
      next: (data: any) => {
        this.testCases = data;
        this.cdr.detectChanges();
      }
    });
  }

  handleApiError(err: any, context: string) {
    this.showToast(`${context} error: ${err.status}`, 'error');
  }

  showToast(msg: string, type: any = 'info') {
    this.toastMessage = msg;
    this.toastType = type;
    this.cdr.detectChanges();
    setTimeout(() => { this.toastMessage = ''; this.cdr.detectChanges(); }, 4000);
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
    if (!this.isProcessing) { this.submitCode(true); }
  }
}