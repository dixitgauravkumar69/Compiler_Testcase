import { Component, ChangeDetectorRef } from '@angular/core';
import { AdminSidebar } from '../../admin-sidebar/admin-sidebar';
import { HttpClient } from '@angular/common/http';
import { BASE_URL } from '../../../../../Environments/environment';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-project-knowledge',
  standalone: true,
  imports: [AdminSidebar, CommonModule, FormsModule],
  templateUrl: './project-knowledge.html',
  styleUrl: './project-knowledge.css',
})
export class ProjectKnowledge {
  isSidebarOpen = false;
  isSubmitting = false;

  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  formData = { title: '', content: '' };

  constructor(
    private readonly http: HttpClient,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  submitForm(): void {
    if (this.isSubmitting) return;
    this.isSubmitting = true;

    this.http.post(`${BASE_URL}/api/admin/add/info`, this.formData).subscribe({
      next: () => {
        this.formData = { title: '', content: '' };
        this.isSubmitting = false;
        this.triggerToast('Entry submitted successfully!', 'success');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.isSubmitting = false;
        this.triggerToast('Failed to submit. Please try again.', 'error');
        this.cdr.detectChanges();
      },
    });
  }

  private triggerToast(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.showToast = false;
      this.cdr.detectChanges();
    }, 3000);
  }
}
