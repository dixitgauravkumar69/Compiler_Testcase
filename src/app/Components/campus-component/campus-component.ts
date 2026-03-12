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

  //  File select
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
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
      .subscribe((res) => {
        alert('Job Added Successfully');
 
        console.log(res);
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
      });
  }
}