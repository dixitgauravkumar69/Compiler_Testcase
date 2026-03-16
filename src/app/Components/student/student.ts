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
      withCredentials:true,
      observe:'response'
  })
  .subscribe({

    next: (res) => {

      if(res.status === 200){
        alert("Questions Loaded ✅");
      }

      this.questions = res.body || [];
      this.loading = false;
      this.cdr.detectChanges();
    },

    error: (err) => {

      if(err.status === 401){
        alert("Login Required ⚠️");
        this.router.navigate(['/login']);
      }

      else if(err.status === 403){
        alert("Access Denied 🚫");
        this.router.navigate(['/403']);
      }

      else if(err.status === 404){
        alert("API Not Found ❌");
        this.router.navigate(['/404']);
      }

      else if(err.status === 500){
        alert("Server Error 💥");
        this.router.navigate(['/500']);
      }

      else{
        alert("Unknown Error 😢");
      }

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