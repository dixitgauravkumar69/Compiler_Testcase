import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BASE_URL } from '../../../Environments/environment';

@Component({
  selector: 'app-campus-component',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './campus-component.html',
  styleUrl: './campus-component.css',
})
export class CampusComponent {
  selectedFile: File | null = null;
  selectedFileName: string = ''; // 👈 File name store karne ke liye

  job: any = {
    company: '',
    title: '',
    jobType: '',
    industry: '',
    location: '',
    semester: '',
    salaryPackage: '',
    eligibility: '',
    bond: '',
    skillsRequired: '',
    jobDescription: '',
    selectionProcess: '',
    registrationLastDate: '',
  };

  constructor(private http: HttpClient) {}

  // File select logic with validation
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.type === 'application/pdf') {
        this.selectedFile = file;
        this.selectedFileName = file.name; // 👈 UI mein naam dikhane ke liye
      } else {
        alert('Please select a PDF file only.');
        event.target.value = ''; // Input clear karein
        this.selectedFileName = '';
        this.selectedFile = null;
      }
    }
  }

  addJob() {
    const formData = new FormData();

    // JSON object send karne ke liye
    formData.append(
      'job',
      new Blob([JSON.stringify(this.job)], { type: 'application/json' })
    );

    // attachment (optional)
    if (this.selectedFile) {
      formData.append('attachment', this.selectedFile);
    }

    this.http
      .post(`${BASE_URL}/placement/addJob`, formData)
      .subscribe({
        next: (res) => {
          alert('Job Added Successfully');
          console.log(res);
          
          // Form reset logic
          this.resetForm();
        },
        error: (err) => {
          alert('Error adding job: ' + err.message);
        }
      });
  }

  // Form ko reset karne ka cleaner tarika
  resetForm() {
    this.job = {
      company: '',
      title: '',
      jobType: '',
      industry: '',
      location: '',
      semester: '',
      salaryPackage: '',
      eligibility: '',
      bond: '',
      skillsRequired: '',
      jobDescription: '',
      selectionProcess: '',
      registrationLastDate: '',
    };
    this.selectedFile = null;
    this.selectedFileName = ''; 
  }
}