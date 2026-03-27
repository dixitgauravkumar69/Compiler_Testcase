import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { BASE_URL } from '../../../../Environments/environment';

@Component({
  selector: 'app-student-leader-board',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-leader-board.html',
  styleUrl: './student-leader-board.css',
})
export class StudentLeaderBoard implements OnInit {
  reports: any[] = [];
  loading: boolean = true;
  totalPoints: number = 0;
  userId: Number = Number(localStorage.getItem("UserId")); // Static for now, as per your API URL

  constructor(private http: HttpClient,private cdr:ChangeDetectorRef,private router:Router) {}

  ngOnInit(): void {
    this.fetchPerformance();
  }

  fetchPerformance() {
    this.loading = true;
    this.http.get<any[]>(`${BASE_URL}/api/student/getYourPerformance/${this.userId}`)
      .subscribe({
        next: (data) => {
          this.reports = data;
          this.calculateTotalPoints();
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error fetching performance:', err);
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  calculateTotalPoints() {
    this.totalPoints = this.reports.reduce((sum, r) => sum + (r.marks || 0), 0);
  }
  goBack() {
    this.router.navigate(['/student']); 
  }
}