import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ProblemStatementService } from '../../Services/problem-statement-service';
import { TestCaseDTO, TestCaseService } from '../../Services/test-case-service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-problem-with-test-cases',
  standalone: true, // Agar aap Angular 17+ use kar rahe hain
  imports: [FormsModule, CommonModule],
  templateUrl: './problem-with-test-cases.html',
  styleUrl: './problem-with-test-cases.css',
})
export class ProblemWithTestCases {
  // Navigation ke liye logic
  @Input() activeSection: string = 'add'; // Default section
  @Output() sectionChange = new EventEmitter<string>(); // Dashboard ko batane ke liye ki section badalna hai

  problemStatement: string = '';
  problemTitle: string = '';
  problemId!: number;
  problemSaved: boolean = false;

  inputData: string = '';
  expectedOutput: string = '';
  message: string = '';
  testCasesAdded: string[] = [];

  ProblemFlag: boolean = false;
  testCaseFlag: boolean = false;

  constructor(
    private problemService: ProblemStatementService,
    private testCaseService: TestCaseService,
    private cdr: ChangeDetectorRef,
    private router:Router
  ) {}

  // Step 1: Save Problem
  saveProblem() {
    if (!this.problemTitle.trim() || !this.problemStatement.trim()) {
      this.message = 'Title and Statement are required!';
      return;
    }

    this.problemService.addProblem(this.problemStatement, this.problemTitle).subscribe({
      next: (res: string) => {
        // Backend se ID extract karna
        const match = res.match(/\d+/);
        if (match) {
          this.problemId = +match[0];
          this.problemSaved = true;
          this.message = `Problem saved! ID: ${this.problemId}. Now add test cases.`;
          this.ProblemFlag = true;
        } else {
          // Agar res sirf "Success" type ka string hai toh alternative handle karein
          this.problemSaved = true;
          this.message = 'Problem saved successfully!';
        }
        this.cdr.detectChanges();
      },
      error: (err) => (this.message = 'Error: ' + err.message),
    });
  }

  // Step 2: Add Test Case
  addTestCase() {
    if (!this.inputData.trim() || !this.expectedOutput.trim()) {
      this.message = 'Input and Expected Output required!';
      return;
    }

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
        this.message = 'Test case added successfully!';
        this.testCaseFlag = true;
        this.cdr.detectChanges();
      },
      error: (err) => (this.message = 'Error: ' + err.message),
    });
  }

  // Dashboard par wapas jaane ke liye (See Problems section)
  finishAndGoBack() {
    this.sectionChange.emit('see'); // Ye parent component (Dashboard) ko signal dega
  }

  // Problem edit mode par wapas jaane ke liye
  resetSteps() {
    this.problemSaved = false;
    this.message = 'Edit mode enabled.';
  }

  AddProblem() {
    if (this.ProblemFlag && this.testCaseFlag) {
      alert('Problem added in your queue SUCCESSFULLY');
      this.router.navigate(['/teacher']);
    } else {
      alert("Sorry Problem can't be add in QUEUE");
    }
  }

  goBack()
  {
    this.router.navigate(['/teacher']);
  }
}
