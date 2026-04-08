import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, signal, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BASE_URL } from '../../../Environments/environment';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { filter, switchMap, tap } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeSwitcher } from '../theme-switcher/theme-switcher';

@Component({
  selector: 'app-campus-component',
  standalone: true,
  imports: [FormsModule, CommonModule, ThemeSwitcher, RouterLink, RouterLinkActive],
  templateUrl: './campus-component.html',
  styleUrls: ['./campus-component.css'],
})
export class CampusComponent {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  // -------------------- TABS STATE --------------------
  activeTab = signal<'post' | 'applied' | 'students'>('post');

  // -------------------- UI STATES --------------------
  selectedFile: File | null = null;
  selectedFileName: string = '';
  toastMessage: string = '';
  showToast = signal<boolean>(false);
  selectedCompany = signal<any>(null);
  teacherId: number = Number(localStorage.getItem("UserId"));

  companySearchQuery = signal<string>('');
  studentSearchQuery = signal<string>('');
  IsProcessing = signal<boolean>(false);

  isSidebarOpen = false;

  // -------------------- JOB MODEL --------------------
  job: any = {
    company: '', title: '', jobType: '', location: '', semester: '', salaryPackage: 0,
    eligibleBranch: '', cgpa: '', bond: 0, skillsRequired: '', jobDescription: '',
    selectionProcess: '', registrationLastDate: ''
  };

  // -------------------- FILTERED COMPANIES --------------------
  availableComponies = toSignal(
    toObservable(this.activeTab).pipe(
      filter(tab => tab === 'applied'),
      tap(() => console.log("Fetching available companies ...")),
      switchMap(() => this.http.get<any[]>(`${BASE_URL}/api/teacher/getAllComponies/${this.teacherId}`))
    ),
    { initialValue: [] }
  );

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

  // -------------------- STUDENTS (Reactive) --------------------
  // Use toSignal so the HTTP call fires ONCE when selectedCompany changes,
  // not on every change detection cycle like computed() would do.
  students = toSignal(
    toObservable(this.selectedCompany).pipe(
      filter(company => !!company && this.activeTab() === 'students'),
      switchMap(company =>
        this.http.get<any[]>(`${BASE_URL}/api/teacher/getAppliedStudents/${company.id}`)
      )
    ),
    { initialValue: [] as any[] }
  );

  filteredStudents = computed(() => {
    const query = this.studentSearchQuery().toLowerCase();
    const data = this.students();
    if (!query) return data;
    return data.filter((item: any) =>
      item.user?.username?.toLowerCase().includes(query) ||
      item.user?.userEmail?.toLowerCase().includes(query) ||
      item.applicationStatus?.toLowerCase().includes(query)
    );
  });

  // -------------------- SEARCH UPDATES --------------------
  updateCompanySearch(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.companySearchQuery.set(val);
  }

  updateStudentSearch(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.studentSearchQuery.set(val);
  }

  // -------------------- JOB METHODS --------------------
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
    // Trim all string fields first
    this.job.company = (this.job.company || '').trim();
    this.job.title = (this.job.title || '').trim();
    this.job.eligibleBranch = (this.job.eligibleBranch || '').trim();
    this.job.location = (this.job.location || '').trim();
    this.job.skillsRequired = (this.job.skillsRequired || '').trim();
    this.job.selectionProcess = (this.job.selectionProcess || '').trim();
    this.job.jobDescription = (this.job.jobDescription || '').trim();

    if (!this.job.company || !this.job.title || !this.job.eligibleBranch ||
        !this.job.cgpa || !this.job.bond || !this.job.salaryPackage ||
        !this.job.semester || !this.job.selectionProcess || !this.job.registrationLastDate) {
      return this.showToastMessage('⚠️ Please fill all required fields');
    }

    if (this.job.company.length < 2) {
      return this.showToastMessage('⚠️ Company name is too short');
    }
    if (this.job.title.length < 2) {
      return this.showToastMessage('⚠️ Job title is too short');
    }

    const formData = new FormData();
    formData.append('job', new Blob([JSON.stringify(this.job)], { type: 'application/json' }));
    if (this.selectedFile) formData.append('attachment', this.selectedFile);

    this.IsProcessing.set(true);

    this.http.post(`${BASE_URL}/placement/addJob`, formData, { observe: 'response' })
      .subscribe({
        next: (res) => {

          
          console.log(res.body);


          if (res.status === 200 || res.status === 201) {
            this.showToastMessage("Job added for student");
            this.resetForm();
            this.cdr.detectChanges();
            this.IsProcessing.set(false);
          }
        },
        error: (err) => {
          this.IsProcessing.set(false);
          this.showToastMessage('Error: ' + err.status);
        }
      });
  }

  resetForm() {
    this.job = { company: '', title: '', jobType: '', location: '', semester: '', salaryPackage: 0,
                 eligibleBranch: '', cgpa: '', bond: 0, skillsRequired: '', jobDescription: '',
                 selectionProcess: '', registrationLastDate: ''};
    this.selectedFile = null;
    this.selectedFileName = '';
  }

  viewStudents(company: any) {
    this.selectedCompany.set(company);
    this.activeTab.set('students'); // no setTimeout needed now
  }

  deleteAction(CampusId: number) {
    this.IsProcessing.set(true);
    this.http.delete(`${BASE_URL}/placement/deleteJob/${CampusId}`, { observe: 'response', responseType: 'text' })
      .subscribe({
        next: (res) => {
          this.IsProcessing.set(false);
          this.showToastMessage("🗑 Job Deleted Successfully");
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.IsProcessing.set(false);
          this.showToastMessage('Error: ' + err.status);
          this.cdr.detectChanges();
        }
      });
  }

  setTab(tab: 'post' | 'applied' | 'students') {
    this.activeTab.set(tab);
  }

  showToastMessage(message: string) {
    this.toastMessage = message;
    this.showToast.set(true);
    setTimeout(() => this.showToast.set(false), 2000);
  }

  // -------------------- SIDEBAR & ROUTING --------------------
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
    document.body.style.overflow = this.isSidebarOpen ? 'hidden' : 'auto';
  }

  closeSidebar() {
    this.isSidebarOpen = false;
    document.body.style.overflow = 'auto';
  }

  goToAddStatement() { this.router.navigate(['/Statement']); }
  goToAddCampus() { this.router.navigate(['/campusAdd']); }
  getProblems(){ this.router.navigate(['/teacher']); }

  logout() { 
    localStorage.clear(); 
    this.router.navigate(["/logout"]);
  }

  back() { this.router.navigate(['/Statement']); }
}