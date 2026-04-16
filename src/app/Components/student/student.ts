import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { BASE_URL } from '../../../Environments/environment';
import { ThemeSwitcher } from '../theme-switcher/theme-switcher';
import { ConnectSSE } from '../../Services/connect-sse';
import { GetStoredNotificationService } from '../../Services/get-stored-notification-service';
import { MarkAsRead } from '../../Services/mark-as-read';

interface Question {
  id: number;
  problemStatement: string;
  assigned: boolean;
  title: string;
}

interface PageResponse {
  content: Question[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

@Component({
  selector: 'app-student-questions',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink, RouterLinkActive, ThemeSwitcher],
  templateUrl: './student.html',
  styleUrls: ['./student.css'],
})
export class Student implements OnInit {
  questions: Question[] = [];
  loading = true;

  problemId!: number;

  // Pagination
  currentPage: number = 0;
  pageSize: number = 5;
  totalPages: number = 0;

  // Sidebar
  isSidebarOpen = false;

  toastMessage: string = '';
  toastType: string = 'success'; // success | error | warning | info

  notifications: any = [];
  notificationCount: Number = 0;
  notifiactionTime: string = '';

  notificationRead=false;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private connectSse: ConnectSSE,
    private notify: GetStoredNotificationService,
    private mark: MarkAsRead,
  ) {}

  ngOnInit(): void {
    const userId = Number(localStorage.getItem('UserId'));

    // we will call function for connectSSE for continue connection
    console.log('call hoga sse');
    this.connectSse.connectSSE();
    console.log('call ho gya sse');

    console.log('call hoga actual from server');

    this.notify.getNotification(userId).subscribe({
      next: (res) => {
        this.notifications = res;
        this.notificationCount = this.notifications.length;
        
        console.log(this.notifications);
      },
      error: (err) => {
        console.log(err.message);
      },
    });

    console.log('call ho gya actual from server');

    this.getQuestions();
  }

  getQuestions(page: number = 0) {
    this.loading = true;

    this.http
      .get<PageResponse>(`${BASE_URL}/student/getQuestions?page=${page}&size=${this.pageSize}`, {
        withCredentials: true,
        observe: 'response',
      })
      .subscribe({
        next: (res) => {
          if (res.status === 200) {
            this.showToast("Your Practice is ready! Let's get started 🚀", 'success');
          }

          if (res.status === 204 || (res.body && res.body.content.length === 0)) {
            this.showToast("You're all caught up! No new tasks assigned for now.", 'info');
          }

          if (res.body) {
            this.questions = res.body.content;
            this.totalPages = res.body.totalPages;
            this.currentPage = res.body.number;
          }

          this.loading = false;
          this.cdr.detectChanges();
        },

        error: (err) => {
          this.loading = false;

          // Professional Error Mapping
          switch (err.status) {
            case 0:
              this.showToast('Connection lost. Please check your internet. 🌐', 'error');

              break;
            case 401:
              this.showToast('Your session expired. Redirecting to login... 🔐', 'warning');
              setTimeout(() => this.router.navigate(['/auth']), 2000);
              break;
            case 403:
              this.showToast("You don't have permission to access this area. ⛔", 'error');
              this.router.navigate(['/403']);
              break;
            case 500:
              this.showToast(
                'Our server is taking a quick break. Please try again later! 💤',
                'error',
              );
              break;
            default:
              this.showToast('Oops! Something went wrong on our end. 🛠️', 'error');
              break;
          }
          this.cdr.detectChanges();
        },
      });
  }

  // Updated Toast duration (Users need time to read messages)
  showToast(msg: string, type: string = 'success') {
    this.toastMessage = msg;
    this.toastType = type;

    setTimeout(() => {
      this.toastMessage = '';
      this.cdr.detectChanges();
    }, 3500); // 3.5 seconds is the sweet spot for readability
    this.cdr.detectChanges();
  }

  solve(id: number) {
    localStorage.setItem('ProblemId', `${id}`);
    this.router.navigate(['/Run']);
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar() {
    this.isSidebarOpen = false;
  }

  isNotificationOpen: boolean = false;

  openNotifications() {
    this.isNotificationOpen = true;
    this.cdr.detectChanges();
  }

  closeNotifications() {
    this.isNotificationOpen = false;
    this.cdr.detectChanges();
  }


  // markAsRead(notifications:any) {
  //   console.log(`notification id is :${notifications.id}`);

  //   this.markRead.MarkAsRead(notifications.id).subscribe({
  //     next:(res)=>{
        
  //       if(notifications.type=="addedJob")
  //       {
  //          this.router.navigate(['findJobInfo']);
  //          console.log("findJobRoute is calling..");
  //       }
        
  //     },
  //   error:(err)=>{
  //     this.showToast(err.message);
  //   }
  // })
  // }

  markReadNotification(notifications:any)
  {
    this.mark.markAsRead(notifications);
  }

}
