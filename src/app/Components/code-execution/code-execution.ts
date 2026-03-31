import { Component, OnInit, OnDestroy, ChangeDetectorRef, HostListener } from '@angular/core';
import { CodeExecutionService } from '../../Services/code-execution-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
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
  // --- UI & State ---
  activeTab: 'problem' | 'code' | 'output' = 'problem';
  isProcessing: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' | 'info' | 'warning' = 'info';

  // --- Problem Data ---
  code: string = '';
  language: string = 'JAVA'; // Default
  output: string = '';
  title: string = 'Loading Problem...';
  description: string = '';
  input: string = '';
  expectedOutput = '';
  testCases: any[] = [];
  Marks: number = 0;
  complexity: string = 'Calculating...';
  totalTestCases:number=0;

  // --- Config & IDs ---
  languages = ['JAVA', 'PYTHON', 'CPP'];
  problemId: number = Number(localStorage.getItem('ProblemId'));
  userId: number = Number(localStorage.getItem('UserId'));

  // --- Anti-Cheat ---
  minutes: number = 0;
  seconds: number = 0;
  intervalId: any;
  readonly EXAM_DURATION_MIN = 30;
  cheatingCount: number = 0;
  readonly MAX_CHEATING_LIMIT = 3;

  private readonly TIMER_KEY = `ExamEndTime_P${this.problemId}_U${this.userId}`;
  private readonly CHEAT_KEY = `CheatCount_P${this.problemId}_U${this.userId}`;
  private readonly REFRESH_FLAG = `HasRefreshed_P${this.problemId}`;

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
      this.submitCode(true); // Trigger Auto Submit
    } else {
      const remaining = this.MAX_CHEATING_LIMIT - this.cheatingCount;
      this.showToast(`⚠️ Warning: ${reason} detected! Attempts left: ${remaining}`, 'warning');
    }
    this.cdr.detectChanges();
  }

  // --- CORE LOGIC ---

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
        
        console.log("Total test cases: "+this.totalTestCases);

        // Correct Marks Logic
        if (this.totalTestCases > 0) {
            this.Marks = (data.marks) * 100;     
        } else {
            this.Marks = data.marks || 0;
        }

        // Call Complexity in parallel
        this.getComplexity();

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
    const payload = {
      code: this.code,
      language: this.language.toLowerCase()
    };

    this.http.post<{complexity: string}>(`${BASE_URL_CCOMPLEXITY}/analyze`, payload).subscribe({
      next: (res) => {
        this.complexity = res.complexity;
        this.showToast("Complexity:"+this.complexity);
        this.cdr.detectChanges();
      },
      error: () => {
        this.complexity = 'Analysis Failed';
        this.showToast(this.complexity);
        this.cdr.detectChanges();
      }
    });
  }

  submitCode(isAutoSubmit: boolean = false) {
    // If already processing and it's a manual click, ignore
    if (this.isProcessing && !isAutoSubmit) return;

    this.isProcessing = true;
    if (this.intervalId) clearInterval(this.intervalId);

    const submitData = {
      marks: this.Marks,
      takenTime: this.calculateUsedTime(),
      userId: this.userId,
      problemId: this.problemId,
      complexity: this.complexity // Storing complexity too
    };

    const url = `${BASE_URL}/api/student/SaveStudentCodeInfo/${this.userId}/${this.problemId}`;

    this.http.post(url, submitData, { responseType: 'text' }).subscribe({
      next: () => {
        this.cleanupExamData();
        this.showToast(isAutoSubmit ? 'Auto-Submitted successfully!' : '🚀 Submitted Successfully!', 'success');
        setTimeout(() => this.router.navigate(['/student']), 2000);
      },
      error: (err) => {
        this.isProcessing = false;
        console.error("Submission Error:", err);
        this.showToast('Submission Failed! Please try again.', 'error');
      }
    });
  }

  // --- HELPERS ---

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
      const newEndTime = now + this.EXAM_DURATION_MIN * 60 * 1000;
      localStorage.setItem(this.TIMER_KEY, newEndTime.toString());
      this.runTimer(newEndTime);
    }
  }

  private runTimer(targetEndTime: number) {
    this.intervalId = setInterval(() => {
      const remainingTimeMs = targetEndTime - Date.now();
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
    const endTime = Number(localStorage.getItem(this.TIMER_KEY));
    const totalMs = this.EXAM_DURATION_MIN * 60 * 1000;
    const remainingMs = Math.max(0, endTime - Date.now());
    const usedMs = totalMs - remainingMs;
    const usedMin = Math.floor(usedMs / 60000);
    const usedSec = Math.floor((usedMs % 60000) / 1000);
    return `${usedMin.toString().padStart(2, '0')}:${usedSec.toString().padStart(2, '0')}`;
  }

  private cleanupExamData() {
    localStorage.removeItem(this.TIMER_KEY);
    localStorage.removeItem(this.CHEAT_KEY);
    localStorage.removeItem(this.REFRESH_FLAG);
    // Don't remove ProblemId here if you need it for the final redirect
  }

  fetchProblemData() {
    this.http.get(`${BASE_URL}/api/code/getProblem/${this.problemId}`).subscribe({
      next: (data: any) => {
        this.title = data.title;
        this.description = data.problemStatement;
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
    this.showToast(`${context} error: ${err.status || 'Server Down'}`, 'error');
  }

  showToast(msg: string, type: any = 'info') {
    this.toastMessage = msg;
    this.toastType = type;
    this.cdr.detectChanges();
    setTimeout(() => { this.toastMessage = ''; this.cdr.detectChanges(); }, 4000);
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }
}