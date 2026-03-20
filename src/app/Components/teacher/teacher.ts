import { Component, OnInit, OnDestroy, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterOutlet } from '@angular/router';
import { BASE_URL } from '../../../Environments/environment';
import { LiveComponent } from '../live-component/live-component';

@Component({
  selector: 'app-teacher',
  standalone: true,
  imports: [CommonModule, RouterOutlet, LiveComponent],
  templateUrl: './teacher.html',
  styleUrls: ['./teacher.css'],
})
export class Teacher implements OnInit, OnDestroy {
  problemStatements: any[] = [];
  activeSection = 'see';
  isLoading = false;

  // Pop-up Control States
  showLiveModal = false;
  selectedProblemId: number = 0;
  solvedStudents: any[] = [];

  // Sidebar State
  isSidebarOpen = false;
  
  private globalTimer: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.getProblemStatements();

    // Global Scheduler: Har 5 second mein IST statuses update karega
    this.globalTimer = setInterval(() => {
      this.updateLiveStatuses();
    }, 5000);
  }

  ngOnDestroy() {
    if (this.globalTimer) {
      clearInterval(this.globalTimer);
    }
  }

  // --- Time Conversion Helper (UTC to IST) ---
  
  private toLocalTime(utcDateString: string): Date {
    if (!utcDateString) return new Date();
    
    let formattedStr = utcDateString;
    // Backend se aane wali string agar "2026-03-20T11:17" hai, 
    // toh 'Z' append kar rahe hain taaki browser use UTC maane aur +5:30 (IST) add kare.
    if (!formattedStr.endsWith('Z') && !formattedStr.includes('+')) {
      formattedStr += 'Z';
    }
    
    return new Date(formattedStr);
  }

  // ⭐ Har card ka status IST ke mutabik calculate karega
  updateLiveStatuses() {
    if (!this.problemStatements || this.problemStatements.length === 0) return;

    const now = new Date();

    this.problemStatements.forEach(ps => {
      if (ps.assigned && ps.startTime && ps.endTime) {
        const start = this.toLocalTime(ps.startTime);
        const end = this.toLocalTime(ps.endTime);

        if (now >= end) {
          ps.statusText = 'Finished';
          ps.isLive = false;
          ps.statusClass = 'status-finished'; 
        } else if (now >= start) {
          ps.statusText = 'Running';
          ps.isLive = true;
          ps.statusClass = 'status-running';
        } else {
          ps.statusText = 'Scheduled';
          ps.isLive = false;
          ps.statusClass = 'status-scheduled';
        }

        // IST formatted timings for display on card
        ps.displayTimeRange = `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        
      } else {
        ps.statusText = 'Not Live';
        ps.statusClass = 'status-none';
        ps.displayTimeRange = '';
      }
    });

    this.cdr.detectChanges();
  }

  // --- API Methods ---

  getProblemStatements() {
    this.isLoading = true;
    this.cdr.detectChanges();
    this.http
      .get<any[]>(`${BASE_URL}/api/User/getProblemStatements`, {
        withCredentials: true,
        observe: 'response',
      })
      .subscribe({
        next: (res) => {
          this.problemStatements = res.body || [];
          this.isLoading = false;
          this.updateLiveStatuses(); // Fetch ke baad status calculate karo
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.handleError(err);
          this.isLoading = false;
          this.cdr.detectChanges();
        },
      });
  }

  assign(psID: number) {
    this.isLoading = true;
    this.http.get(`${BASE_URL}/teacher/assignProblem/${psID}`, { responseType: 'text' }).subscribe({
      next: (res) => {
        this.isLoading = false;
        alert(res);
        // Page reload ki jagah fresh data fetch karo
        this.getProblemStatements(); 
      },
      error: (err) => {
        this.handleError(err);
        this.isLoading = false;
      },
    });
  }

  fetchSolvedStudents(problemId: number) {
    this.isLoading = true;
    this.selectedProblemId = problemId;
    this.http.get<any[]>(`${BASE_URL}/api/teacher/getStudents/${problemId}`).subscribe({
      next: (data) => {
        this.solvedStudents = data;
        this.activeSection = 'studentsList';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // --- Event Handlers & Helpers ---

  receiveDataFromChild(data: any) {
    this.showLiveModal = false;
    const index = this.problemStatements.findIndex(p => p.id === data.id);
    if (index !== -1) {
      this.problemStatements[index] = data;
    }
    this.updateLiveStatuses();
  }

  liveStream(problemId: number) {
    this.selectedProblemId = problemId;
    this.showLiveModal = true; 
  }

  refreshAndClose() {
    this.showLiveModal = false;
    this.getProblemStatements();
  }

  toggleSidebar() { this.isSidebarOpen = !this.isSidebarOpen; }
  closeSidebar() { this.isSidebarOpen = false; }

  @HostListener('document:click', ['$event'])
  onClick(event: any) {
    const sidebar = document.querySelector('.sidebar');
    const menuBtn = document.querySelector('.menu-btn');
    if (this.isSidebarOpen && sidebar && !sidebar.contains(event.target) && menuBtn && !menuBtn.contains(event.target)) {
      this.closeSidebar();
    }
  }

  @HostListener('document:keydown.escape')
  onEsc() { this.closeSidebar(); }

  goToAddStatement() { this.closeSidebar(); this.router.navigate(['/Statement']); }
  goToAddCampus() { this.closeSidebar(); this.router.navigate(['/campusAdd']); }
  logout() { this.router.navigate(['/logout']); }

  private handleError(err: any) {
    if (err.status === 401) {
      alert('Session Expired');
      this.router.navigate(['/login']);
    } else if (err.status === 403) {
      alert("Access Denied 🚫");
      setTimeout(() => this.router.navigate(['/403']), 1500);
    } else if (err.status === 404) {
      this.router.navigate(['/404']);
    } else if (err.status === 500) {
      this.router.navigate(['/500']);
    } else {
      alert('Unknown Error');
    }
  }
}