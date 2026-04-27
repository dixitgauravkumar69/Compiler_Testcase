import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AdminSidebar } from '../admin-sidebar/admin-sidebar';
import { GetUsers } from '../../../Services/AdminService/get-users';
import { CommonModule } from '@angular/common';
import { GetApprovalRequests } from '../../../Services/AdminService/get-approval-requests';
import { UpdateApprovement } from '../../../Services/AdminService/update-approvement';
import { UpdateStatus } from '../../../Services/AdminService/update-status';
import { FormsModule } from '@angular/forms';

import { AddAuditService } from '../../../Services/add-audit-service';
import { ReasonService } from '../../../Services/AddReasonService/reason-service';  

@Component({
  selector: 'app-admin',
  imports: [AdminSidebar, CommonModule,FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements OnInit {


  USERS: any[] = [];
  GetApprovalRequests: any[] = [];
  Status: string = '';
  reasonText: string = '';

  toasterMessage: string = '';
  toasterType: 'success' | 'error' | 'info' = 'info';
  showToast: boolean = false;
  isSidebarOpen = false;
  activeTab: string = 'users';
  toastTimer: any = null;
  isReasonModalOpen: boolean = false;



  auditUser: number = 0;

  constructor(
    private getUsers: GetUsers,
    private getApprovalRequests: GetApprovalRequests,
    private updateApprovements: UpdateApprovement,
    private cdr: ChangeDetectorRef,
    private updateStatus: UpdateStatus,
    private addAuditService: AddAuditService,
    private reasonService: ReasonService,
  ) {}

  ngOnInit(): void {
    this.getAllUsers();
  }

  /* ===== USERS ===== */
  getAllUsers() {
    this.getUsers.getAllUsers().subscribe(
      (response) => {
        this.USERS = response;
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error fetching users:', error);
      },
    );
  }

  /* ===== APPROVAL REQUEST ===== */
  getApprovalRequest() {
    this.getApprovalRequests.getApprovalRequests().subscribe(
      (response: any[]) => {
        
        this.GetApprovalRequests = response.map((req) => ({
          ...req,
          status: 'PENDING', // default state
        }));

        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error fetching approval requests:', error);
      },
    );
  }

  /* ===== APPROVE ===== */
  approveRequest(requestId: number) {
    this.updateApprovements.updateApprovement(requestId, true).subscribe({
      next: (res) => {
        console.log('Approvement updated successfully:', res);
        this.showToaster('Request approved successfully!', 'success');
        this.Status = 'APPROVED';

        this.getApprovalRequest();

        this.auditUser=requestId;
        this.reasonService.AddReason("Request approved", "APPROVE",requestId,this.auditedBy) ;
          this.closeReasonModal();

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error updating approvement:', error.message);
      },
    });
  }

  rejectRequest(requestId: number) {
    this.updateApprovements.updateApprovement(requestId, false).subscribe({
      next: (res) => {
        console.log('Approvement updated successfully:', res);
        this.showToaster('Request rejected successfully!', 'success');
        this.Status = 'REJECTED';

        this.getApprovalRequest();

        this.auditUser=requestId;
        this.reasonService.AddReason("Request rejected", "REJECT",requestId,this.auditedBy) ;
          this.closeReasonModal();

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error updating approvement:', error.message);
      },
    });
  }

  showToaster(message: string, type: 'success' | 'error' | 'info' = 'info') {
    this.toasterMessage = message;
    this.toasterType = type;
    this.showToast = true;

    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }

    this.toastTimer = setTimeout(() => {
      this.showToast = false;
      this.cdr.detectChanges();
    }, 3000);
  }

  changeStatus(user: any, event: any) {
    console.log(user);
   
    const newStatus =event.target.value;
    const oldStatus = user.status;
  

   const status = { status: newStatus,
    
    };

    // UI update
    user.status = newStatus;

    //Deactivation logic jisme  reason stored hoga kyu deactivate kiya ja rha h user ko

  if(newStatus=="DEACTIVATE")
  {
      this.openReasonModal();
      this.auditUser=user.userId;
  }

  if(user.userRole=="ADMIN")
  {
    this.showToaster("Cannot change status of an admin user! 🚫", "error");
    this.cdr.detectChanges();
    user.status = oldStatus; // Revert UI change
    return;
  }


    // API call

    this.updateStatus.updateStatus(user.userId, status).subscribe({
      next: (res) => {
        console.log('Status updated successfully:', res);
        this.showToaster(`User status updated to ${newStatus}!`, 'success');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error updating status:', err);
        user.status = oldStatus; // Revert UI change

        if (err.status === 404) {
          this.showToaster('User not found 🔍', 'error');
        } else if (err.status === 403) {
          const backendMessage = err.error?.message || err.error || 'Access denied';
          this.showToaster(backendMessage + ' 🚫', 'error');
        }
      },
    });
  }


  openReasonModal() {
    this.isReasonModalOpen = true;
   
  }

  closeReasonModal() {
    this.isReasonModalOpen = false;
  }



  // AddReason(reason: string, action: string,auditingUser:number,auditedBy:number) 
  // {
  //   console.log('Reason for deactivation:', reason);

  //   const auditData = {
  //     reason: reason, // Replace with actual user ID
  //   action: action,
  //   };
   
  //   this.addAuditService.addAudit(auditData,auditingUser,auditedBy ).subscribe({
  //     next: (res) => {
  //       alert("Audit added successfully") ;
  //       console.log('Audit added successfully:', res);
  //     },
  //     error: (err) => {
  //       console.error('Error adding audit:', err.message);
  //     },
  //   });


  //   this.closeReasonModal();
  // }

  auditedBy:number =parseInt(localStorage.getItem('UserId') || '0');
 auditingUser:number = this.auditUser;

  AddReason(reason: string, action: string)
  {
    this.reasonService.AddReason(reason, action,this.auditingUser,this.auditedBy) ;
    this.closeReasonModal();
  }


}
