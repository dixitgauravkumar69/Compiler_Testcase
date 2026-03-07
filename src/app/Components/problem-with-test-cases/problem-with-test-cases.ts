import { Component } from '@angular/core';
import { ProblemStatementService } from '../../Services/problem-statement-service';
import { TestCaseDTO, TestCaseService } from '../../Services/test-case-service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-problem-with-test-cases',
  imports: [FormsModule,CommonModule],
  templateUrl: './problem-with-test-cases.html',
  styleUrl: './problem-with-test-cases.css',
})
export class ProblemWithTestCases {
   problemStatement: string = '';
  problemId!: number;
  problemSaved: boolean = false;

  inputData: string = '';
  expectedOutput: string = '';
  message: string = '';
  testCasesAdded: string[] = [];

  constructor(
    private problemService: ProblemStatementService,
    private testCaseService: TestCaseService,
    private cdr:ChangeDetectorRef
  ) {}

  // Step 1: Save Problem
  saveProblem() {
    if (!this.problemStatement.trim()) {
      this.message = "Enter Problem Statement!";
      return;
    }

    this.problemService.addProblem(this.problemStatement).subscribe({
      next: (res: string) => {
        // Assuming backend returns: "Problem saved with ID: 4"
        const match = res.match(/\d+/);
        if (match) {
          this.problemId = +match[0];
          this.problemSaved = true;
          this.message = `Problem saved! ID: ${this.problemId}. Now add test cases.`;
        }

        this.cdr.detectChanges();
      },
      error: (err) => this.message = "Error: " + err.message
    });
  }

  // Step 2: Add Test Case
  addTestCase() {
    if (!this.inputData.trim() || !this.expectedOutput.trim()) {
      this.message = "Input and Expected Output required!";
      return;
    }

    const testCase: TestCaseDTO = {
      problemId: this.problemId,
      inputData: this.inputData,
      expectedOutput: this.expectedOutput
    };

    this.testCaseService.addTestCase(testCase).subscribe({
      next: () => {
        this.testCasesAdded.push(`Input: ${this.inputData} | Output: ${this.expectedOutput}`);
        this.inputData = '';
        this.expectedOutput = '';
        this.message = "Test case added!";

        this.cdr.detectChanges();
      },


      error: (err) => this.message = "Error: " + err.message
    });
  }
}
