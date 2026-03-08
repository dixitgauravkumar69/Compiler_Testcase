import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

interface Question {
  id: number;
  problemStatement: string;
  assigned: boolean;
}

@Component({
  selector: 'app-student-questions',
  standalone:true,
  imports:[ReactiveFormsModule,CommonModule],
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
    this.http.get<Question[]>("http://localhost:8080/student/getQuestions",{
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

}