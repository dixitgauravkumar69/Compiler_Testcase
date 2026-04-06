import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Component, signal, inject, computed } from '@angular/core'; 
import { FormsModule } from '@angular/forms';
import { BASE_URL } from '../../../Environments/environment';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { filter, switchMap, tap } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';

import { Router } from '@angular/router';
@Component({
  selector: 'app-campus-component',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './campus-component.html',
  styleUrl: './campus-component.css',
})
export class CampusComponent {
  private http = inject(HttpClient); // another way for injecting something new try....

  // 1. TABS STATE
  activeTab = signal<'post' | 'applied' | 'students'>('post');

  // 2. UI STATES
  selectedFile: File | null = null;
  selectedFileName: string = '';
  toastMessage: string = '';
  showToast=signal<boolean>(false);

  selectedCompany = signal<any>(null);

  teacherId:Number=Number(localStorage.getItem("UserId")); 

// for searhing componies and students in there tabs........
  companySearchQuery = signal<string>('');
  studentSearchQuery = signal<string>('');
  IsProcessing=signal<boolean>(false);

  //  FILTERED COMPANIES (Computed).... for find calculated or derived values...
  filteredCompanies = computed(() => {
    const query = this.companySearchQuery().toLowerCase();
    const data = this.availableComponies();
    if (!query) return data;
    return data.filter(item => 
     item.company?.toLowerCase().includes(query) || 
      item.location?.toLowerCase().includes(query) ||
      item.eligibleBranch?.toLowerCase().includes(query)
     
    );
  });

  // FILTERED STUDENTS (Computed)
  filteredStudents = computed(() => {
    const query = this.studentSearchQuery().toLowerCase();
    const data = this.students();
    if (!query) return data;
    return data.filter(item => 
     item.user?.username?.toLowerCase().includes(query) || 
      item.user?.userEmail?.toLowerCase().includes(query) ||
      item.applicationStatus?.toLowerCase().includes(query)
    );
  });


  // Helper method for search inputs
  updateCompanySearch(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.companySearchQuery.set(val);
  }

  updateStudentSearch(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.studentSearchQuery.set(val);
  }

  // 3. JOB MODEL
  job: any = {
    company: '', title: '', jobType: '',
    location: '', semester: '', salaryPackage:0,
    eligibleBranch: '', cgpa: '', bond: 0,
    skillsRequired: '', jobDescription: '',
    selectionProcess: '', registrationLastDate: '',
    
  };

 
  // Jaise hi setTab('applied') hoga, ye pipeline automatically trigger ho jayegi.


  //find componies which information is published by teacher.....
  availableComponies = toSignal(
    toObservable(this.activeTab).pipe(
      filter(tab => tab === 'applied'), 
      tap(() => console.log("Fetching available componies ...")), 
      switchMap(() => this.http.get<any[]>(`${BASE_URL}/api/teacher/getAllComponies/${this.teacherId}`))
    ),
    { initialValue: [] }
  );



 students = toSignal(
  toObservable(this.activeTab).pipe(
    // 1. Check karein ki tab 'students' hai aur company selected hai
    filter(tab => tab === 'students' && this.selectedCompany() !== null),
    tap(() => console.log("Fetching Students for:", this.selectedCompany()?.company)),
    
    // 2. switchMap ke andar dynamic ID pass karein
    switchMap(() => {
      const id = this.selectedCompany()?.id; // Yahan se campus ID milegi
      return this.http.get<any[]>(`${BASE_URL}/api/teacher/getAppliedStudents/${id}`);
    })
  ),
  { initialValue: [] } // Initial empty array taaki UI break na ho
);


  constructor(private cdr:ChangeDetectorRef,
    private router:Router,
  ) {
    
  }

  setTab(tab: 'post' | 'applied' | 'students') {
    this.activeTab.set(tab);
  }

  // --- ACTIONS ---

  showToastMessage(message: string) {
    this.toastMessage = message;
    this.showToast.set(true);
    setTimeout(() => { this.showToast.set(false);
    
     }, 2000);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file?.type === 'application/pdf') {
      this.selectedFile = file;
      this.selectedFileName = file.name;
    } else {
      this.showToastMessage('❌ Only PDF allowed');
      this.selectedFile = null;
    }
  }

 
 addJob() {
  if (
  !this.job.company ||
  !this.job.title ||
  !this.job.eligibleBranch ||
  !this.job.cgpa ||
  !this.job.bond ||
  !this.job.salaryPackage ||
  !this.job.semester ||
  !this.job.selectionProcess ||
  !this.job.registrationLastDate
) {
  return this.showToastMessage('⚠️ Please fill all required fields');
}

  const formData = new FormData();
  formData.append(
    'job',
    new Blob([JSON.stringify(this.job)], { type: 'application/json' })
  );

  if (this.selectedFile) {
    formData.append('attachment', this.selectedFile);
  }

  this.IsProcessing.set(true); //  loader ON
  console.log("Loader on");

  this.http.post(`${BASE_URL}/placement/addJob`, formData, { observe: 'response' })
    .subscribe({
      next: (res) => {
        if (res.status === 200 || res.status === 201) {
         this.showToastMessage("Job added for student");
          this.resetForm();
          console.log("Loader off hone vala hai");
          this.IsProcessing.set(false);
          console.log("Loader off");
        }
        
      },
      error: (err) => {
        this.IsProcessing.set(false); //  loader OFF 
        this.showToastMessage('Error: ' + err.status);
      }
    });
}

  resetForm() {
    this.job = { company: '', title: '', jobType: '', location: '', semester: '', salaryPackage: 0, eligibleBranch: '', cgpa: '', bond: 0, skillsRequired: '', jobDescription: '', selectionProcess: '', registrationLastDate: ''};
    this.selectedFile = null;
    this.selectedFileName = '';
  }

  viewStudents(company: any) {
  this.selectedCompany.set(company);
  this.setTab('students');
}

deleteAction(CampusId: number) {

  this.IsProcessing.set(true); 

  this.http.delete(`${BASE_URL}/placement/deleteJob/${CampusId}`, { observe: 'response',responseType: 'text' })
    .subscribe({
      next: (res) => {

        if (res.status === 200 || res.status === 204) {
          this.IsProcessing.set(false);
          this.showToastMessage("🗑 Job Deleted Successfully");

         
        }

        this.IsProcessing.set(false); 
      },

      error: (err) => {
        this.IsProcessing.set(false); 
        this.showToastMessage('Error: ' + err.status);
      }
    });
}





isSidebarOpen = false;



 
  goToAddStatement() { this.router.navigate(['/Statement']); }
  goToAddCampus() { this.router.navigate(['/campusAdd']); }
  getProblems(){
     this.router.navigate(['/teacher']);
  }


    
  logout() { 
    localStorage.clear(); 
    // this.showToast("Logged out successfully", "info");
    this.router.navigate(["/logout"])
  
    
  }

  back()
  {
    this.router.navigate(['/Statement']);
  }


  toggleSidebar() {
  this.isSidebarOpen = !this.isSidebarOpen;

  if (this.isSidebarOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'auto';
  }
}

closeSidebar() {
  this.isSidebarOpen = false;
  document.body.style.overflow = 'auto';
}
}
