import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CodeExecutionService } from '../../Services/code-execution-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BASE_URL } from '../../../Environments/environment';

@Component({
  selector: 'app-code-runner',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './code-execution.html',
  styleUrls: ['./code-execution.css']
})
export class CodeExecution implements OnInit, OnDestroy {

  // UI State
  activeTab: 'problem' | 'code' | 'output' = 'problem'; // Mobile tabs control

  // Problem Data
  code: string = '';
  language: string = 'JAVA';
  output: string = '';
  title: string = '';
  description: string = '';
  input: string = '';
  expectedOutput = '';
  testCases: any[] = [];
  
  // Configuration
  languages = ['JAVA', 'PYTHON', 'CPP'];
  problemId: number = Number(localStorage.getItem("ProblemId"));
  
  // Timer Logic
  minutes: number = 30; 
  seconds: number = 0;
  intervalId: any;

  // Evaluation
  marks: number = 0;

  constructor(
    private api: CodeExecutionService,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    if (!this.problemId) {
      alert("Problem ID not found!");
      return;
    }
    this.fetchProblemData();
    this.fetchTestCases();
    this.startTimer();
  }

  fetchProblemData() {
    this.http.get(`${BASE_URL}/api/code/getProblem/${this.problemId}`)
      .subscribe({
        next: (data: any) => {
          this.title = data.title;
          this.description = data.problemStatement;
          this.cdr.detectChanges();
        },
        error: (err) => console.error("Error fetching problem:", err)
      });
  }

  fetchTestCases() {
    this.http.get(`${BASE_URL}/api/code/getTestCases/${this.problemId}`)
      .subscribe({
        next: (data: any) => {
          this.testCases = data;
          if (data.length > 0) {
            this.input = data[0].inputData;
            this.expectedOutput = data[0].expectedOutput;
          }
          this.cdr.detectChanges();
        },
        error: (err) => console.error("Error fetching test cases:", err)
      });
  }

  startTimer() {
    if (this.intervalId) clearInterval(this.intervalId);

    this.intervalId = setInterval(() => {
      if (this.minutes === 0 && this.seconds === 0) {
        clearInterval(this.intervalId);
        alert("⏰ Time Out! Your code is being submitted.");
        this.submitCode();
        return;
      }

      if (this.seconds === 0) {
        this.minutes--;
        this.seconds = 59;
      } else {
        this.seconds--;
      }
      this.cdr.detectChanges();
    }, 1000);
  }

  runCode() {
    if (!this.code.trim()) {
      alert("Please write some code first!");
      return;
    }

    this.output = 'Running...';
    // Mobile par automatic output tab par le jaye
    if (window.innerWidth <= 768) {
      this.activeTab = 'output';
    }

    this.api.runCode(this.code, this.language, this.problemId).subscribe({
      next: (res: any) => {
        let data = typeof res === 'string' ? JSON.parse(res) : res;
        
        if (data.testCases && Array.isArray(data.testCases)) {
          this.output = data.testCases.join('\n');
        } else {
          this.output = data.output || 'No output received.';
        }
        
        this.marks = data.marks ?? 0;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.output = 'Error: ' + (err.error?.message || err.message);
        this.cdr.detectChanges();
      }
    });
  }

  submitCode() {
    clearInterval(this.intervalId);

    const uId = Number(localStorage.getItem('UserId'));
    const pId = this.problemId;

    if (!uId || !pId) {
      alert("User ID ya Problem ID missing hai!");
      return;
    }

    // Calculate Taken Time
    const totalSeconds = (30 * 60) - ((this.minutes * 60) + this.seconds);
    const usedMin = Math.floor(totalSeconds / 60);
    const usedSec = totalSeconds % 60;
    const timeString = `${usedMin.toString().padStart(2, '0')}:${usedSec.toString().padStart(2, '0')}`;

    const body = {
      marks: this.marks,
      takenTime: timeString,
      userId: uId,
      problemId: pId
    };

    this.http.post(`${BASE_URL}/api/student/SaveStudentCodeInfo/${uId}/${pId}`, body, { responseType: 'text' })
      .subscribe({
        next: (response: any) => {
          alert(`🚀 Code Submitted!\nMarks Secured: ${this.marks}\nTime Taken: ${timeString}`);
          this.resetForm();
        },
        error: (err) => {
          console.error("Submission Error:", err);
          alert("Database sync failed, but your session is recorded.");
        }
      });
  }

  resetForm() {
    this.code = '';
    this.output = '';
    this.marks = 0;
    this.activeTab = 'problem'; // Reset to description
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }
}