import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BASE_URL } from '../../../../Environments/environment';
import { ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Location } from '@angular/common';

@Component({
  selector: 'app-edit-test-case',
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-test-case.html',
  styleUrl: './edit-test-case.css',
})
export class EditTestCase implements OnInit {
  isEditMode: boolean = false;
  problemId!: Number;
  testCases: any[] = [];

  toastMessage: string = '';
  showToastFlag: boolean = false;
  toastType: 'success' | 'error' | 'warning' = 'success';

  isLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private location:Location,
  ) {}

  ngOnInit() {
    this.problemId = Number(this.route.snapshot.paramMap.get('id'));

    if (this.problemId) {
      this.isEditMode = true;
      this.loadProblemData(this.problemId); // API call
    }
  }

 loadProblemData(pId: Number) {

  this.isLoading = true;

  this.http.get<any>(`${BASE_URL}/api/testcase/getTestCase/${pId}`).subscribe({
    next: (data) => {
      this.testCases = data;
      this.isLoading = false;
      this.showToast("Data loaded 🚀", "success");

    
      this.cdr.detectChanges();
    },
    error: () => {
      this.isLoading = false;
      this.showToast("Failed to load data ❌", "error");
    }
  });
}

  editTestCaseData = {
    inputData: '', // form se aayega ye value
    expectedOutput: '', // form se aayega ye value
  };
  
 saveEdit() {

  this.isLoading = true;

  this.http.put(`${BASE_URL}/api/testcase/editTestCase/${this.problemId}`, this.editTestCaseData)
    .subscribe({
      next: (res) => {
        this.isLoading = false;
        this.showToast("Test case updated successfully ✅", "success");
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.showToast("Error updating test case ❌", "error");
        console.error(err);
        this.cdr.detectChanges();
      }
    });
}

  delete(testCaseId: number) {

  this.http.delete(`${BASE_URL}/api/testcase/deleteTestCase/${testCaseId}`, { responseType: "text" })
    .subscribe({
      next: (res) => {

       
        this.testCases = this.testCases.filter(tc => tc.id !== testCaseId);

        this.showToast("Test case Deleted", "warning");
        console.log(res);

      },
      error: (err) => {
        this.showToast("Error in deleting testCase", "error");
        console.log(err);
      }
    });
}
   
 private toastTimeout: any;

showToast(message: string, type: 'success' | 'error' | 'warning' = 'success') {

  this.toastMessage = message;
  this.toastType = type;
  this.showToastFlag = true;

  this.cdr.detectChanges();

  // previous timeout clear karo
  if (this.toastTimeout) {
    clearTimeout(this.toastTimeout);
  }

  this.toastTimeout = setTimeout(() => {
    this.showToastFlag = false;
    this.cdr.detectChanges();
  }, 2000);
}


goToBack()
{
 this.location.back();
}
}
