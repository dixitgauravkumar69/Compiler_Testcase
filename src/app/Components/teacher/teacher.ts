import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterOutlet } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { BASE_URL } from '../../../Environments/environment';
import { LiveComponent } from '../live-component/live-component';

@Component({
  selector: 'app-teacher',
  standalone: true,
  // FIXED: Yahan LiveComponent ko imports mein add kar diya hai
  imports: [CommonModule, RouterOutlet, LiveComponent], 
  templateUrl: './teacher.html',
  styleUrls: ['./teacher.css'],
})
export class Teacher implements OnInit {
  problemStatements: any[] = [];
  activeSection = 'see';
  isLoading = false;

  // Pop-up Control States
  showLiveModal = false;
  selectedProblemId: number = 0;


  Response:any;

  // Sidebar State
  isSidebarOpen = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  
 // Class ke andar variables define karo
private globalTimer: any;

ngOnInit() {
  this.getProblemStatements();

  //  Best Approach: Global Scheduler
  // Ye har 5 second mein saare cards ka status check karke UI update karega
  this.globalTimer = setInterval(() => {
    this.updateLiveStatuses();
  }, 5000); 
}

// ⭐ Ye function saare problems ka status calculate karega
updateLiveStatuses() {
  if (!this.problemStatements || this.problemStatements.length === 0) return;

  const now = new Date();

  this.problemStatements.forEach(ps => {
    if (ps.assigned && ps.startTime && ps.endTime) {
      const start = new Date(ps.startTime);
      const end = new Date(ps.endTime);

      if (now >= end) {
        ps.statusText = 'Finished';
        ps.isLive = false;
      } else if (now >= start) {
        ps.statusText = 'Running';
        ps.isLive = true;
      } else {
        ps.statusText = 'Scheduled';
        ps.isLive = false;
      }
    } else {
      ps.statusText = 'Not Live';
    }
  });

  // Angular ko batao ki data badal gaya hai, UI refresh karo
  this.cdr.detectChanges();
}

// Jab user page se bahar jaye, to timer band kar do (Memory safety)
ngOnDestroy() {
  if (this.globalTimer) {
    clearInterval(this.globalTimer);
  }
}



// Child se data aane par array update karo
receiveDataFromChild(data: any) {
  this.showLiveModal = false;
  
  const index = this.problemStatements.findIndex(p => p.id === data.id);
  if (index !== -1) {
    this.problemStatements[index] = data; // Naya data array mein dal diya
  }
  
  this.updateLiveStatuses(); // Turant update karo bina 5 sec wait kiye
}

  // Sidebar Toggle
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar() {
    this.isSidebarOpen = false;
  }

  // Outside click close
  @HostListener('document:click', ['$event'])
  onClick(event: any) {
    const sidebar = document.querySelector('.sidebar');
    const menuBtn = document.querySelector('.menu-btn');

    if (
      this.isSidebarOpen &&
      sidebar &&
      !sidebar.contains(event.target) &&
      menuBtn &&
      !menuBtn.contains(event.target)
    ) {
      this.closeSidebar();
    }
  }

  // ESC key close
  @HostListener('document:keydown.escape')
  onEsc() {
    this.closeSidebar();
  }

  

  // ================= API =================

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
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.handleError(err);
          this.isLoading = false;
        },
      });
  }

  private handleError(err: any) {
    if (err.status === 401) {
      alert('Session Expired');
      this.router.navigate(['/login']);
    } else if (err.status === 403) {
      alert("Access Denied 🚫");
      setTimeout(() => {
        this.router.navigate(['/403']);
      }, 1500);
    } else if (err.status === 404) {
      this.router.navigate(['/404']);
    } else if (err.status === 500) {
      this.router.navigate(['/500']);
    } else {
      alert('Unknown Error');
    }
  }

  assign(psID: number) {
    this.isLoading = true;
    this.http.get(`${BASE_URL}/teacher/assignProblem/${psID}`, { responseType: 'text' }).subscribe({
      next: (res) => {
        this.isLoading = false;
        alert(res);
        window.location.reload();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.handleError(err);
        this.isLoading = false;
      },
    });
  }

  goToAddStatement() {
    this.closeSidebar();
    this.router.navigate(['/Statement']);
  }

  goToAddCampus() {
    this.closeSidebar();
    this.router.navigate(['/campusAdd']);
  }

  logout() {
    this.router.navigate(['/logout']);
  }

  solvedStudents: any[] = [];
  
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

 
  liveStream(problemId: number) {
    console.log("Live stream modal activated for ID: " + problemId);
    this.selectedProblemId = problemId;
    this.showLiveModal = true; 
  }


  refreshAndClose() {
  this.showLiveModal = false; // Modal band karo
  this.getProblemStatements(); // API se naya data lao (is-me assigned true milega ab)
}






}