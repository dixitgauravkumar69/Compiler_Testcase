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

  getQuestions() {
    this.http.get<Question[]>(`${BASE_URL}/student/getQuestions`,{
      withCredentials:true
    })
      .subscribe({
        next: (data) => {
          this.questions = data;
          
          this.loading = false;


           console.log(this.questions);
          this.cdr.detectChanges();

         
        },
        error: (err) => {
          console.error("Error fetching questions", err);
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