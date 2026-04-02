import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BASE_URL } from '../../../Environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-job-description',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './job-description.html',
  styleUrl: './job-description.css',
})
export class JobDescription implements OnInit {

  job: any;
  campusId!: number;
  userId!: number;
  isOutDated:boolean=false;

  toast = {
    message: '',
    type: 'success' as 'success' | 'error' | 'info' | 'warning',
    show: false
  };

  isApplied: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private router:Router,
  ) {}

  showToast(msg: string, type: 'success' | 'error' | 'info' | 'warning') {
    this.toast.show = false;

    setTimeout(() => {
      this.toast.message = msg;
      this.toast.type = type;
      this.toast.show = true;

      setTimeout(() => {
        this.toast.show = false;
        this.cdr.detectChanges();
      }, 3000);

      this.cdr.detectChanges();
    }, 100);
  }

  ngOnInit(): void {

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.campusId = Number(id);

    const uid = localStorage.getItem("UserId");
    if (!uid) return;

    this.userId = Number(uid);

    this.http.get(`${BASE_URL}/placement/student/job/${this.campusId}`)
      .subscribe({
        next: (res: any) => {
          this.job = res;
          this.showToast("Job Loaded", "success");
        },
        error: () => {
          this.showToast("Failed to load job", "error");
        }
      });
  }

 apply() {
  if (this.isApplied) return;



 if(Date.now==this.job.registrationLastDate)
 {
   this.showToast("Application closed hai ....","warning");
   this.isOutDated=true;
   this.cdr.detectChanges();
 }

 

  confirm("Are you comfortable with all terms and condition");
  
  this.http.post(
    `${BASE_URL}/api/student/studentApplicationData/${this.userId}/${this.campusId}`,
    {},
    { responseType: 'text' }
  ).subscribe({
    next: (res: string) => {
      this.showToast(res, "success");
      this.isApplied = true;   // ✅ button disable ho jayega
    },
    error: (err) => {
      if (err.status === 409) {
        this.showToast("Already Applied", "info");
        this.isApplied = true; 
      } else if (err.status === 403) {
        this.showToast("Not Eligible", "error");
      } else {
        this.showToast("Server Error", "error");
      }
    }
  });
}
  getFileName(url: string): string {
    return url ? url.split('/').pop() || 'attachment.pdf' : 'attachment.pdf';
  }

  Back()
  {
   this.router.navigate(["/findJobInfo"]) ;
  }
}