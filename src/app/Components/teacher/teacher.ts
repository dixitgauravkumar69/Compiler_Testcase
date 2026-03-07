import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterOutlet } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-teacher',
  standalone: true,
  imports: [CommonModule,RouterOutlet],
  templateUrl: './teacher.html',
  styleUrls: ['./teacher.css']
})
export class Teacher implements OnInit {

  problemStatements: any[] = [];
  activeSection = "see";
 

  constructor(private http: HttpClient, private router: Router,
    private cdr:ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.getProblemStatements();
  }

  getProblemStatements() {
    this.http.get<any[]>("http://localhost:8080/api/User/getProblemStatements")
    .subscribe(res => {
      this.problemStatements = res;
      this.cdr.detectChanges();

    
    });
  }

  

  assign(psID:number)
  {
     this.http.get<any[]>(`http://localhost:8080/teacher/assignProblem/${psID}`)
    .subscribe(res => {
      this.problemStatements = res;
      this.cdr.detectChanges();

      
    });
  }


  goToAddStatement() {
    this.router.navigate(['/Statement']);
  }

}