import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
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
  number: number; // Current page index
  size: number;   // Items per page
}

@Component({
  selector: 'app-student-questions',
  standalone:true,
  imports:[ReactiveFormsModule,CommonModule,RouterLink,RouterOutlet],
  templateUrl: './student.html',
  styleUrls: ['./student.css']
})
export class Student implements OnInit {

  questions: Question[] = [];
  loading = true;

  problemId!:number;

  constructor(private http: HttpClient,
    private cdr:ChangeDetectorRef,
    private router:Router
  ) {}

  ngOnInit(): void {
    this.getQuestions();
  }

 // Naye variables add karein
currentPage: number = 0;
pageSize: number = 5;
totalPages: number = 0;

getQuestions(page: number = 0) {
  this.loading = true;
  // URL mein page aur size parameters bhejien
  this.http.get<PageResponse>(`${BASE_URL}/student/getQuestions?page=${page}&size=${this.pageSize}`, {
    withCredentials: true,
    observe: 'response'
  })
  .subscribe({
    next: (res) => {
      if (res.body) {
        this.questions = res.body.content; // List 'content' ke andar hogi
        this.totalPages = res.body.totalPages;
        this.currentPage = res.body.number;
        this.cdr.detectChanges();
      }
      this.loading = false;
      this.cdr.detectChanges();
    },
    error: (err) => {
      // ... aapka purana error logic ...
      this.loading = false;
    }
  });
}

  solve(id:number)
  {
   localStorage.setItem("ProblemId",`${id}`);
   
    this.router.navigate(['/Run']);
  }


  isSidebarOpen = false;

toggleSidebar(){
  this.isSidebarOpen = !this.isSidebarOpen;
}

closeSidebar(){
  this.isSidebarOpen = false;
}
}