import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { BASE_URL } from '../../../Environments/environment';



interface Question {
  id: number;
  problemStatement: string;
  assigned: boolean;
}

interface PageResponse {
  content: Question[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

@Component({
  selector: 'app-student-questions',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    RouterLink,
   
   
  ],
  templateUrl: './student.html',
  styleUrls: ['./student.css']
})
export class Student implements OnInit {

  questions: Question[] = [];
  loading = true;

  problemId!: number;

  // Pagination
  currentPage: number = 0;
  pageSize: number = 5;
  totalPages: number = 0;

  // Sidebar
  isSidebarOpen = false;

  toastMessage: string = '';
  toastType: string = 'success'; // success | error | warning | info


  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private router: Router,
 
  ) {}

  ngOnInit(): void {
    this.getQuestions();
  }

  

 getQuestions(page: number = 0) {
  this.loading = true;

  this.http.get<PageResponse>(
    `${BASE_URL}/student/getQuestions?page=${page}&size=${this.pageSize}`,
    { withCredentials: true, observe: 'response' }
  ).subscribe({
    next: (res) => {
      if (res.status === 200) {
        this.showToast("Your Practice is ready! Let's get started 🚀", "success");
      }

      if (res.status === 204 || (res.body && res.body.content.length === 0)) {
        this.showToast("You're all caught up! No new tasks assigned for now.", "info");
      }

      if (res.body) {
        this.questions = res.body.content;
        this.totalPages = res.body.totalPages;
        this.currentPage = res.body.number;
      }

      this.loading = false;
      this.cdr.detectChanges();
    },

    error: (err) => {
      this.loading = false;
      
      // Professional Error Mapping
      switch (err.status) {
        case 0:
          this.showToast("Connection lost. Please check your internet. 🌐", "error");
          
          break;
        case 401:
          this.showToast("Your session expired. Redirecting to login... 🔐", "warning");
          setTimeout(() => this.router.navigate(['/login']), 2000);
          break;
        case 403:
          this.showToast("You don't have permission to access this area. ⛔", "error");
            this.router.navigate(['/403']);
          break;
        case 500:
          this.showToast("Our server is taking a quick break. Please try again later! 💤", "error");
          break;
        default:
          this.showToast("Oops! Something went wrong on our end. 🛠️", "error");
          break;
      }
      this.cdr.detectChanges();
    }
  });
}

// Updated Toast duration (Users need time to read messages)
showToast(msg: string, type: string = 'success') {
  this.toastMessage = msg;
  this.toastType = type;

  setTimeout(() => {
    this.toastMessage = '';
    this.cdr.detectChanges();
  }, 3500); // 3.5 seconds is the sweet spot for readability
  this.cdr.detectChanges();
}

  solve(id: number) {
    localStorage.setItem("ProblemId", `${id}`);
    this.router.navigate(['/Run']);
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar() {
    this.isSidebarOpen = false;
  }

 
}