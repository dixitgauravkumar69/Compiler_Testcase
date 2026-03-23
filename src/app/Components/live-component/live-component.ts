import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BASE_URL } from '../../../Environments/environment';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-live-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './live-component.html',
  styleUrl: './live-component.css',
})
export class LiveComponent implements OnInit {

  @Input() problemId!: number; 
  @Output() onClose = new EventEmitter<void>();
  @Output() onConfirm = new EventEmitter<any>();

  liveForm: FormGroup;
  
  // ⭐ Professional States
  isLoading: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' | 'info' = 'info';

  constructor(
    private fb: FormBuilder, 
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private zone: NgZone // For ensuring UI updates
  ) {
    this.liveForm = this.fb.group({
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    // Optional: Set default start time to "Now"
  }

  submit() {
    if (this.liveForm.invalid) {
      this.showToast("Please fill all time fields 🕰️", "info");
      return;
    }

    const start = new Date(this.liveForm.value.startTime);
    const end = new Date(this.liveForm.value.endTime);
    const now = new Date();

    // ⭐ Logic Check: Realistic Validation
    if (start < now) {
      this.showToast("Cannot schedule in the past!", "error");
      return;
    }
    if (end <= start) {
      this.showToast("End time must be after Start time!", "error");
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();

    const data = {
      startTime: this.liveForm.value.startTime + ":00",
      endTime: this.liveForm.value.endTime + ":00"
    };

    const url = `${BASE_URL}/api/faculty/live/${this.problemId}`;

    this.http.post(url, data).subscribe({
      next: (response) => {
        this.zone.run(() => {
          this.isLoading = false;
          this.showToast("Live Stream Synced Successfully! 📡", "success");
          
          // Delay closing so user can see the success toast
          setTimeout(() => {
            this.onConfirm.emit(response);
            this.onClose.emit();
            this.cdr.detectChanges();
          }, 1500);
        });
      },
      error: (err) => {
        this.zone.run(() => {
          this.isLoading = false;
          console.error("API Error:", err);
          this.showToast("Link failed. Check network.", "error");
          this.cdr.detectChanges();
        });
      }
    });
  }

  // ⭐ Professional Toast Handler
  showToast(msg: string, type: 'success' | 'error' | 'info' = 'info') {
    this.toastMessage = msg;
    this.toastType = type;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.toastMessage = '';
      this.cdr.detectChanges();
    }, 3500);
  }

  close() {
    if (!this.isLoading) {
      this.onClose.emit();
    }
  }
}