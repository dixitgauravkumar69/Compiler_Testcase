import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BASE_URL } from '../../../Environments/environment';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ThemeSwitcher } from '../theme-switcher/theme-switcher';

@Component({
  selector: 'app-find-placement-info',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink, RouterLinkActive, ThemeSwitcher],
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
  userId!:number;
  Semester!: number;

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
  this.userId = parseInt(localStorage.getItem("UserId") || "0");

  // First API call: get user profile
  this.http.get(`${BASE_URL}/api/student/Profile/${this.userId}`)
    .subscribe({
      next: (res: any) => {
        // Save semester & Branch to localStorage
        localStorage.setItem("Semester", String(res.semester));
        localStorage.setItem("Branch:",String(res.branch) );


        this.Semester = res.semester; // update local variable

        // Now call second API using the semester
        this.http.get<any[]>(`${BASE_URL}/placement/getJobInfo/${this.Semester}/${res.branch}`)
          .subscribe({
            next: (jobsRes) => {
              this.zone.run(() => {
                this.jobs = jobsRes;
                this.isLoading = false;
                if (jobsRes.length > 0) {
                  this.showToast(`${jobsRes.length} opportunities synced! 🚀`, 'success');
                }
                this.cdr.detectChanges();
              });
            },
            error: (err) => {
              this.zone.run(() => {
                this.isLoading = false;
                this.showToast("Connection error while fetching jobs. Please try again.", "error");
                this.cdr.detectChanges();
              });
            }
          });
      },
      error: (err) => {
        this.zone.run(() => {
          this.isLoading = false;
          this.showToast("Semester not found", "error");
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
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) return this.jobs;
    return this.jobs.filter(job =>
      job.company?.toLowerCase().includes(term) ||
      job.title?.toLowerCase().includes(term) ||
      job.location?.toLowerCase().includes(term) ||
      job.eligibleBranch?.toLowerCase().includes(term)
    );
  }

  onSearch() { /* triggers getter re-evaluation via change detection */ }

  isDeadlineSoon(dateStr: string): boolean {
    if (!dateStr) return false;
    const deadline = new Date(dateStr);
    const daysLeft = (deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return daysLeft >= 0 && daysLeft <= 5;
  }

  back()
  {
    this.router.navigate(["/student"]);
  }

  
  isSidebarOpen = false;

toggleSidebar() {
  this.isSidebarOpen = !this.isSidebarOpen;
}

closeSidebar() {
  this.isSidebarOpen = false;
}

}