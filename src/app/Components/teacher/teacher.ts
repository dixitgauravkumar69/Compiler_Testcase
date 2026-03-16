import { Component, OnInit, HostListener } from '@angular/core';
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
  styleUrls: ['./teacher.css'],
})
export class Teacher implements OnInit {
  problemStatements: any[] = [];
  activeSection = 'see';
  isLoading = false;

  // ⭐ Sidebar State
  isSidebarOpen = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.getProblemStatements();
  }

  // Sidebar Toggle
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar() {
    this.isSidebarOpen = false;
  }

  //  Outside click close
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

  //  ESC key close
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
          if (err.status === 401) {
            alert('Session Expired');
            this.router.navigate(['/login']);
          }  else if(err.status === 403){

    alert("Access Denied 🚫");

    setTimeout(()=>{
       this.router.navigate(['/403']);
    },1500);   //  1.5 second delay
  } else if (err.status === 404) {
            this.router.navigate(['/404']);
          } else if (err.status === 500) {
            this.router.navigate(['/500']);
          } else {
            alert('Unknown Error');
          }

          this.isLoading = false;
        },
      });
  }

  assign(psID: number) {
    this.isLoading = true;
    this.http.get<any[]>(`${BASE_URL}/teacher/assignProblem/${psID}`).subscribe({
      next: (res) => {
        this.problemStatements = res;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (err.status === 401) {
          alert('Session Expired');
          this.router.navigate(['/login']);
        } else if (err.status === 403) {
          this.router.navigate(['/403']);
        } else if (err.status === 404) {
          this.router.navigate(['/404']);
        } else if (err.status === 500) {
          this.router.navigate(['/500']);
        } else {
          alert('Unknown Error');
        }

        this.isLoading = false;
      },
    });
  }

  goToAddStatement() {
    this.closeSidebar(); //  mobile me auto close
    this.router.navigate(['/Statement']);
  }

  goToAddCampus() {
    this.closeSidebar(); //  mobile me auto close
    this.router.navigate(['/campusAdd']);
  }

  logout()
  {
    this.router.navigate(['/logout']);
  }
}
