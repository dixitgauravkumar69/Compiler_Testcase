import { Component, OnInit, OnDestroy, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs'; // For performance
import { BASE_URL } from '../../../Environments/environment';
import { LiveComponent } from '../live-component/live-component';

@Component({
  selector: 'app-teacher',
  standalone: true,
  imports: [CommonModule, RouterOutlet, LiveComponent, FormsModule],
  templateUrl: './teacher.html',
  styleUrls: ['./teacher.css'],
})
export class Teacher implements OnInit, OnDestroy {
  // --- Data States ---
  problemStatements: any[] = [];
  filteredProblems: any[] = [];
  searchQuery: string = '';
  searchSubject = new Subject<string>(); 
  
  // --- UI States ---
  activeSection = 'see';
  isLoading = false;
  showLiveModal = false;
  selectedProblemId: number = 0;
  solvedStudents: any[] = [];
  isSidebarOpen = false;

  filteredStudents: any[] = [];
studentSearchQuery: string = '';

  // --- Toast Notification State ---
  toast = {
    show: false,
    message: '',
    type: 'info' as 'success' | 'error' | 'info' | 'warning'
  };
  
  private globalTimer: any;
  isEditMode = false;
editForm: any = {};

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    // Optimized Search: Waits for 300ms pause in typing before filtering
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => this.performFiltering());
  }

  ngOnInit() {
    this.getProblemStatements();
    this.globalTimer = setInterval(() => this.updateLiveStatuses(), 5000);
  }

  ngOnDestroy() {
    if (this.globalTimer) clearInterval(this.globalTimer);
    this.searchSubject.complete();
  }

  // --- TOAST HELPER ---
  showToast(msg: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') {
    this.toast = { show: true, message: msg, type: type };
    this.cdr.detectChanges();
    setTimeout(() => {
      this.toast.show = false;
      this.cdr.detectChanges();
    }, 2000);
  }

  // --- SEARCH LOGIC ---
  onSearch() {
    this.searchSubject.next(this.searchQuery);
  }

  private performFiltering() {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) {
      this.filteredProblems = [...this.problemStatements];
    } else {
      this.filteredProblems = this.problemStatements.filter(ps => 
        ps.id.toString().includes(query) || 
        ps.problemStatement.toLowerCase().includes(query)
        
      );
    }
    this.cdr.detectChanges();
  }

  // --- API CALLS WITH ROBUST HANDLING ---
  getProblemStatements() {
    this.isLoading = true;
    this.http.get<any[]>(`${BASE_URL}/api/User/getProblemStatements`, { withCredentials: true, observe: 'response' })
      .subscribe({
        next: (res) => {
          this.problemStatements = res.body || [];
          this.filteredProblems = [...this.problemStatements];
          this.isLoading = false;
          this.updateLiveStatuses();
          if (this.problemStatements.length === 0) {
            this.showToast("No problems found in repository", "info");
          }
        },
        error: (err) => this.handleError(err, "Failed to load problems")
      });
  }

  assign(psID: number) {
    this.isLoading = true;
    this.http.get(`${BASE_URL}/teacher/assignProblem/${psID}`, { responseType: 'text' }).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.showToast("Problem assigned successfully!", "success");
        this.getProblemStatements(); 
      },
      error: (err) => this.handleError(err, "Assignment failed")
    });
  }

  fetchSolvedStudents(problemId: number) {
    this.isLoading = true;
    this.selectedProblemId = problemId;
    this.http.get<any[]>(`${BASE_URL}/api/teacher/getStudents/${problemId}`).subscribe({
      next: (data) => {
        this.solvedStudents = data;
        this.filteredStudents = [...data];
        this.activeSection = 'studentsList';
        this.isLoading = false;
        this.showToast(`Loaded ${data.length} submissions`, "info");
      },
      error: (err) => this.handleError(err, "Could not fetch results")
    });
  }

  // --- CORE LOGIC ---
  updateLiveStatuses() {
    if (!this.problemStatements.length) return;
    const now = new Date();

    this.problemStatements.forEach(ps => {
      if (ps.assigned && ps.startTime && ps.endTime) {
        const start = this.toLocalTime(ps.startTime);
        const end = this.toLocalTime(ps.endTime);

        if (now >= end) {
          ps.statusText = 'Finished';
          ps.statusClass = 'status-finished';
        } else if (now >= start) {
          ps.statusText = 'Running';
          ps.statusClass = 'status-running';
        } else {
          ps.statusText = 'Scheduled';
          ps.statusClass = 'status-scheduled';
        }
        ps.displayTimeRange = `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      } else {
        ps.statusText = 'Not Live';
        ps.statusClass = 'status-none';
        ps.displayTimeRange = 'Not Set';
      }
    });
    this.performFiltering(); 
  }

  public toLocalTime(utcDateString: string): Date {
    if (!utcDateString) return new Date();
    let formattedStr = utcDateString;
    if (!formattedStr.endsWith('Z') && !formattedStr.includes('+')) formattedStr += 'Z';
    return new Date(formattedStr);
  }

  private handleError(err: HttpErrorResponse, customMsg: string) {
    this.isLoading = false;
    let message = customMsg;

    if (err.status === 401) {
      this.showToast("Session expired. Please login again.", "error");
      this.router.navigate(['/login']);
    } else if (err.status === 403) {
      this.showToast("Access Denied: You don't have permission.", "error");
      this.router.navigate(['/403']);
    } else if (err.status === 0) {
      this.showToast("Server is unreachable. Check connection.", "error");
    } else {
      this.showToast(`${customMsg} (Code: ${err.status})`, "error");
    }
    this.cdr.detectChanges();
  }

  // --- NAVIGATION & UI ---
  receiveDataFromChild(data: any) {
    this.showLiveModal = false;
    const index = this.problemStatements.findIndex(p => p.id === data.id);
    if (index !== -1) {
      this.problemStatements[index] = data;
      this.showToast("Live settings updated", "success");
    }
    this.updateLiveStatuses();
  }

  logout() { 
    localStorage.clear(); 
    this.showToast("Logged out successfully", "info");
    this.router.navigate(['/login']); 
  }

  @HostListener('document:click', ['$event'])
  onClick(event: any) {
    const sidebar = document.querySelector('.sidebar');
    const trigger = document.querySelector('.menu-trigger');
    if (this.isSidebarOpen && sidebar && !sidebar.contains(event.target) && !trigger?.contains(event.target)) {
      this.closeSidebar();
    }
  }

  liveStream(id: number) { this.selectedProblemId = id; this.showLiveModal = true; }
  toggleSidebar() { this.isSidebarOpen = !this.isSidebarOpen; }
  closeSidebar() { this.isSidebarOpen = false; }
  goToAddStatement() { this.router.navigate(['/Statement']); }
  goToAddCampus() { this.router.navigate(['/campusAdd']); }






  onStudentSearch() {
  const query = this.studentSearchQuery.toLowerCase().trim();
  if (!query) {
    this.filteredStudents = [...this.solvedStudents];
  } else {
    this.filteredStudents = this.solvedStudents.filter(s => 
      s.user.username.toLowerCase().includes(query) || 
      s.user.userEmail.toLowerCase().includes(query)
    );
  }
}




//edit and delete cards of problem in .........................



 deleteProblem(id: number) {
  const confirmDelete = confirm("Are you sure you want to delete this problem? This cannot be undone.");
  
  if (confirmDelete) {
    // Call delete service ...............................................
    this.http.delete(`${BASE_URL}/teacher/deleteProblem/${id}`,{responseType: 'text'}).subscribe({
      next: () => {
        this.showToast("🗑️ Problem deleted successfully");
        this.cdr.detectChanges();
      
      },
      error: (err) => this.showToast("Error deleting: " + err.status)
    });
  }
}




editProblem(problem: any) {
  this.isLoading = true; // Loader start
  
  // STEP 1: Sabse pehle API se get request se data la ke form fill kr lia..............
  this.http.get<any>(`${BASE_URL}/teacher/editProblem/${problem.id}`).subscribe({
    next: (data) => {
      // STEP 2: Jab data aa jaye, tab form fill kia aur dikhaya......
      this.editForm = { ...data }; 
      this.isEditMode = true;
      this.isLoading = false;
      this.showToast("Problem details loaded", "info");
    },
    error: (err) => {
      this.handleError(err, "Could not fetch problem details");
      this.isLoading = false;
    }
  });
}

// ---  Update Problem Method (New logic with PATCH) --- when we click save button than after actual patch request will trigger
updateProblem() {
  if (!this.editForm.title || !this.editForm.problemStatement) {
    this.showToast("Required fields are missing!", "warning");
    return;
  }

  this.isLoading = true;
  const problemId = this.editForm.id;

  // STEP 3: Jab user update click kare, tab Patch request maro
  this.http.patch(`${BASE_URL}/teacher/updateProblem/${problemId}`, this.editForm, { responseType: 'text' })
    .subscribe({
      next: (response) => {
        this.isLoading = false;
        this.isEditMode = false; // Modal close karein
        this.showToast("🚀 " + response, "success");
        this.getProblemStatements(); // Refresh logic to show updated data in grid
      },
      error: (err) => {
        this.isLoading = false;
        this.handleError(err, "Update failed");
      }
    });
}
}
