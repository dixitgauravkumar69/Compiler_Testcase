import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BASE_URL } from '../../../Environments/environment';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-live-component', // Note: Agar dashboard me [problemId] error aa rha hai to ise 'app-live' kar dena
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './live-component.html',
  styleUrl: './live-component.css',
})
export class LiveComponent {

  @Input() problemId!: number; 
  @Output() onClose = new EventEmitter<void>();
  @Output() onConfirm = new EventEmitter<any>();

  liveForm: FormGroup;

  // HttpClient ko constructor me inject kiya gaya hai
  constructor(private fb: FormBuilder, private http: HttpClient,private cdr:ChangeDetectorRef,) {
    this.liveForm = this.fb.group({
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
     
    });
  }

  submit() {
    if (this.liveForm.valid) {
      // Data prepare kiya
      const data = {
        startTime: this.liveForm.value.startTime + ":00",
        endTime: this.liveForm.value.endTime + ":00"
      };

      // API Call: 902 ki jagah dynamic problemId use ki hai
      const url = `${BASE_URL}/api/faculty/live/${this.problemId}`;

      this.http.post(url, data).subscribe({
        next: (response) => {
          console.log("Success Response:", response);
          alert("Your Timing for Live stream is saved...");

          this.onConfirm.emit(response);
          this.onClose.emit();
          
          this.cdr.detectChanges();
          
        },
        error: (err) => {
          console.error("API Error:", err);
          alert("Failed to call API. Check console.");
        }
      });
    }
  }

  close() {
    this.onClose.emit();
  }
}