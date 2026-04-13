import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BASE_URL } from '../../../Environments/environment';

@Component({
  selector: 'app-job-description',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './job-description.html',
  styleUrl: './job-description.css',
})
export class JobDescription implements OnInit {

  job: any = null;
  campusId!: number;
  userId!: number;

  isPageLoading = true;
  isApplied = false;
  isApplying = false;
  selectionStatus:string="";

  toast = {
    message: '',
    type: 'info' as 'success' | 'error' | 'info' | 'warning',
    show: false
  };

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {}

 ngOnInit(): void {
  const id = this.route.snapshot.paramMap.get('id');
  if (!id) { 
    this.isPageLoading = false; 
    return; 
  }

  this.campusId = Number(id);
  this.userId = Number(localStorage.getItem('UserId') || '0');

  this.http.get(`${BASE_URL}/placement/student/job/${this.campusId}`).subscribe({
    next: (res: any) => {
      this.job = res;
      this.isPageLoading = false;

      this.checkIfAlreadyApplied();

      //  CALL HERE (after job loaded)
      this.selectionStatusStudent(this.userId, this.campusId);

      this.cdr.detectChanges();
    },
    error: () => {
      this.isPageLoading = false;
      this.showToast('Failed to load job details.', 'error');
      this.cdr.detectChanges();
    }
  });
}



  selectionStatusStudent(UserId:number,CampusId:number)
  {
      this.http.get(`${BASE_URL}/student/jobSelection/${CampusId}/${UserId}`, { responseType: 'text' } ).subscribe({next:(res)=>{
            
        this.selectionStatus=res;
        this.showToast("Data loaded successfully");
      },
    error:(err)=>{
        alert(err.message);
    }})
  }




  checkIfAlreadyApplied() {

      this.http.get(`${BASE_URL}/api/student/studentApplication/isApplied/${this.userId}`).subscribe({
        next:(res)=>
        { 
          if(res==true)
            {
              this.isApplied=true;
              this.showToast("You have already applied")
            }  
            else
            {
              this.isApplied=false;
            }

         },
        error:(err)=>
        {
         alert(err.message);
        }
      })
    
  }

  apply() {
    if (this.isApplied || this.isApplying) return;

    if (this.isExpired(this.job?.registrationLastDate)) {
      this.showToast('Applications are closed for this drive.', 'warning');
      return;
    }

    const confirmed = confirm(
      `Apply for ${this.job.title} at ${this.job.company}?\n\nMake sure you meet the eligibility criteria before applying.`
    );
    if (!confirmed) return;

    this.isApplying = true;
    this.cdr.detectChanges();

    this.http.post(
      `${BASE_URL}/api/student/studentApplicationData/${this.userId}/${this.campusId}`,
      {},
      { responseType: 'text' }
    ).subscribe({
      next: (res: string) => {
        this.isApplying = false;
        this.isApplied = true;
        this.showToast('Application submitted successfully!', 'success');
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isApplying = false;
        if (err.status === 409) {
          this.isApplied = true;
          this.showToast('You have already applied for this position.', 'info');
        } else if (err.status === 403) {
          this.showToast('You are not eligible for this drive.', 'error');
        } else {
          this.showToast('Something went wrong. Please try again.', 'error');
        }
        this.cdr.detectChanges();
      }
    });
  }

  isExpired(dateStr: string): boolean {
    if (!dateStr) return false;
    return new Date(dateStr).getTime() < Date.now();
  }

  isDeadlineSoon(dateStr: string): boolean {
    if (!dateStr) return false;
    const deadline = new Date(dateStr);
    const daysLeft = (deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return daysLeft >= 0 && daysLeft <= 5;
  }

  getSkills(skillsStr: string): string[] {
    if (!skillsStr) return [];
    return skillsStr.split(/[,،;\/\n]+/).map(s => s.trim()).filter(s => s.length > 0);
  }

  getFileName(url: string): string {
    return url ? url.split('/').pop() || 'attachment.pdf' : 'attachment.pdf';
  }

  showToast(msg: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') {
    this.toast = { show: true, message: msg, type };
    this.cdr.detectChanges();
    setTimeout(() => {
      this.toast.show = false;
      this.cdr.detectChanges();
    }, 3500);
  }

  Back() {
    this.router.navigate(['/findJobInfo']);
  }
}
