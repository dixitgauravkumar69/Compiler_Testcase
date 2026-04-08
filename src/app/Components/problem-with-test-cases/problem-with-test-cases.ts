import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { ProblemStatementService } from '../../Services/problem-statement-service';
import { TestCaseDTO, TestCaseService } from '../../Services/test-case-service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeSwitcher } from '../theme-switcher/theme-switcher';

@Component({
  selector: 'app-problem-with-test-cases',
  standalone: true,
  imports: [FormsModule, CommonModule, ThemeSwitcher, RouterLink, RouterLinkActive],
  templateUrl: './problem-with-test-cases.html',
  styleUrl: './problem-with-test-cases.css',
})
export class ProblemWithTestCases {
  @Input() activeSection: string = 'add'; 
  @Output() sectionChange = new EventEmitter<string>(); 

  // --- Loader & Toast State ---
  isLoading: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' | 'info' | 'warning' = 'info';

  problemStatement: string = '';
  problemTitle: string = '';
  problemId!: number;
  problemSaved: boolean = false;

  inputData: string = '';
  expectedOutput: string = '';
  testCasesAdded: string[] = [];

  ProblemFlag: boolean = false;
  testCaseFlag: boolean = false;
  level: string = '';

  constructor(
    private problemService: ProblemStatementService,
    private testCaseService: TestCaseService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  // Step 1: Save Problem
  saveProblem() {
    const title = this.problemTitle.trim();
    const statement = this.problemStatement.trim();
    const level = this.level.trim();

    if (!title || !statement || !level) {
      this.showToast('All fields (Title, Statement, Level) are required!', 'warning');
      return;
    }

    // Minimum meaningful length guard
    if (title.length < 3) {
      this.showToast('Problem title must be at least 3 characters.', 'warning');
      return;
    }
    if (statement.length < 10) {
      this.showToast('Problem statement is too short. Please describe the problem properly.', 'warning');
      return;
    }

    // Write back trimmed values so API receives clean data
    this.problemTitle = title;
    this.problemStatement = statement;
    this.level = level;

    this.isLoading = true;
    this.problemService.addProblem(this.problemStatement, this.problemTitle, this.level).subscribe({
      next: (res: string) => {
        const match = res.match(/\d+/);
        if (match) {
          this.problemId = +match[0];
          this.problemSaved = true;
          this.ProblemFlag = true;
          this.showToast(`Problem saved! ID: ${this.problemId}`, 'success');
        } else {
          this.problemSaved = true;
          this.showToast('Problem saved successfully!', 'success');
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.showToast('Error saving problem: ' + err.message, 'error');
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  // Step 2: Add Test Case
  addTestCase() {
    const input = this.inputData.trim();
    const output = this.expectedOutput.trim();

    if (!input || !output) {
      this.showToast('Input and Expected Output are required!', 'warning');
      return;
    }

    // Write back trimmed values
    this.inputData = input;
    this.expectedOutput = output;

    this.isLoading = true;
    const testCase: TestCaseDTO = {
      problemId: this.problemId,
      inputData: this.inputData,
      expectedOutput: this.expectedOutput,
    };

    this.testCaseService.addTestCase(testCase).subscribe({
      next: () => {
        this.testCasesAdded.push(`In: ${this.inputData} → Out: ${this.expectedOutput}`);
        this.inputData = '';
        this.expectedOutput = '';
        this.testCaseFlag = true;
        this.showToast('Test case added!', 'success');
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.showToast('Error adding test case: ' + err.message, 'error');
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  // Final Action (Instead of Alert)
  AddProblem() {
    if (this.ProblemFlag && this.testCaseFlag) {
      this.showToast('Problem added to queue successfully!', 'success');
      setTimeout(() => {
        this.router.navigate(['/teacher']);
      }, 1500);
    } else {
      this.showToast("Cannot add to queue. Save problem and test cases first.", 'error');
    }
  }

  // --- Helper Methods ---
  showToast(msg: string, type: any = 'info') {
    this.toastMessage = msg;
    this.toastType = type;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.toastMessage = '';
      this.cdr.detectChanges();
    }, 3000);
  }

  finishAndGoBack() { this.sectionChange.emit('see'); }
  resetSteps() { this.problemSaved = false; this.showToast('Edit mode enabled', 'info'); }
  goBack() { this.router.navigate(['/teacher']); }



  isSidebarOpen:boolean=false;

    toggleSidebar() { this.isSidebarOpen = !this.isSidebarOpen; }
  closeSidebar() { this.isSidebarOpen = false; }
  goToAddStatement() { this.router.navigate(['/Statement']); }
  goToAddCampus() { this.router.navigate(['/campusAdd']); }
  getProblems(){
     this.router.navigate(['/teacher']);
  }


    
  logout() { 
    localStorage.clear(); 
    // this.showToast("Logged out successfully", "info");
    this.router.navigate(["/logout"])
  
    
  }


 
  



handleProblemsClick() {
  this.activeSection = 'see';
  this.getProblems();
  this.closeSidebar();
}

handleAddStatement() {
  this.activeSection = 'add';
  this.closeSidebar();
}

handleCampus() {
 this.router.navigate(['/campusAdd'])
}
}