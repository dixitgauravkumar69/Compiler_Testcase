import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Component, signal, inject } from '@angular/core'; 
import { FormsModule } from '@angular/forms';
import { BASE_URL } from '../../../Environments/environment';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { filter, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-campus-component',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './campus-component.html',
  styleUrl: './campus-component.css',
})
export class CampusComponent {
  private http = inject(HttpClient); // Modern way to inject

  // 1. TABS STATE
  activeTab = signal<'post' | 'applied' | 'students'>('post');

  // 2. UI STATES
  selectedFile: File | null = null;
  selectedFileName: string = '';
  toastMessage: string = '';
  showToast: boolean = false;

  selectedCompany = signal<any>(null);

  teacherId:Number=Number(localStorage.getItem("UserId")); 

  // 3. JOB MODEL
  job: any = {
    company: '', title: '', jobType: '', industry: '',
    location: '', semester: '', salaryPackage: '',
    eligibleBranch: '', cgpa: '', bond: '',
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


  constructor() {
    
  }

  setTab(tab: 'post' | 'applied' | 'students') {
    this.activeTab.set(tab);
  }

  // --- ACTIONS ---

  showToastMessage(message: string) {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => { this.showToast = false; }, 2000);
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

  //ApI calling ka pichhla tarika ..........................
  addJob() {
    if (!this.job.company || !this.job.title) return this.showToastMessage('Required fields missing');
    
    const formData = new FormData();
    formData.append('job', new Blob([JSON.stringify(this.job)], { type: 'application/json' }));
    if (this.selectedFile) formData.append('attachment', this.selectedFile);

    this.http.post(`${BASE_URL}/placement/addJob`, formData, { observe: 'response' })
    .subscribe({
      next: (res) => {
        if (res.status === 200 || res.status === 201) {
          this.showToastMessage('✅ Job Added Successfully');
          this.resetForm();
        }
      },
      error: (err) => this.showToastMessage('Error: ' + err.status)
    });
  }

  resetForm() {
    this.job = { company: '', title: '', jobType: '', industry: '', location: '', semester: '', salaryPackage: '', eligibleBranch: '', cgpa: '', bond: '', skillsRequired: '', jobDescription: '', selectionProcess: '', registrationLastDate: '', };
    this.selectedFile = null;
    this.selectedFileName = '';
  }

  viewStudents(company: any) {
  this.selectedCompany.set(company);
  this.setTab('students');
}
}