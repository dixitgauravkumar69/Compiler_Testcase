import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterOutlet } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { BASE_URL } from '../../../Environments/environment';
@Component({
  selector: 'app-teacher',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './teacher.html',
  styleUrls: ['./teacher.css']
})
export class Teacher implements OnInit {

  problemStatements: any[] = [];
  activeSection = "see";
  isLoading = false; // <-- spinner flag

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.getProblemStatements();
  }

  getProblemStatements() {
    this.isLoading = true; // start spinner

    this.cdr.detectChanges();
    this.http.get<any[]>(`${BASE_URL}/api/User/getProblemStatements`)
      .subscribe({
        next: (res) => {
          this.problemStatements = res;
        
          this.isLoading = false; // stop spinner
            this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false; // stop spinner even on error
        }
      });
  }

  assign(psID: number) {
    this.isLoading = true; // spinner while assigning
    this.http.get<any[]>(`${BASE_URL}/teacher/assignProblem/${psID}`)
      .subscribe({
        next: (res) => {
          this.problemStatements = res;
          this.cdr.detectChanges();
          this.isLoading = false;
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
        }
      });
  }

  goToAddStatement() {
    this.router.navigate(['/Statement']);
  }

  goToAddCampus() {
    this.router.navigate(['/campusAdd']);
  }
}