import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core'; // Added NgZone
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BASE_URL } from '../../../Environments/environment';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-find-placement-info',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,FormsModule],
  templateUrl: './find-placement-info.html',
  styleUrl: './find-placement-info.css',
})
export class FindPlacementInfo implements OnInit {
  jobs: any[] = [];
  isLoading: boolean = true;
  
  //  Toast State
  toastMessage: string = '';
  toastType: 'success' | 'error' | 'info' = 'info';
  searchTerm: string = '';

  constructor(
    private http: HttpClient, 
    private router: Router, 
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    this.fetchJobs();
  }

  fetchJobs() {
    this.isLoading = true;
    this.http.get<any[]>(`${BASE_URL}/placement/getJobInfo/6`)
      .subscribe({
        next: (res) => {
          this.zone.run(() => {
            this.jobs = res;
            this.isLoading = false;
            if (res.length > 0) {
              this.showToast(`${res.length} opportunities synced! 🚀`, 'success');
            }
            this.cdr.detectChanges();
          });
        },
        error: (err) => {
          this.zone.run(() => {
            this.isLoading = false;
            this.showToast("Connection error. Please try again.", "error");
            this.cdr.detectChanges();
          });
        }
      });
  }

  //  Professional Toast Trigger
  showToast(msg: string, type: 'success' | 'error' | 'info' = 'info') {
    this.toastMessage = msg;
    this.toastType = type;
    this.cdr.detectChanges();

    // Auto-hide after 3.5 seconds
    setTimeout(() => {
      this.toastMessage = '';
      this.cdr.detectChanges();
    }, 3500);
  }

  viewDescription(id: number) {
    this.showToast("Opening position details...", "info");
    this.router.navigate(['/jobDescription', id]);
  }

  get filteredJobs() {
    return this.jobs.filter(job => 
      job.company.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      job.title.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}