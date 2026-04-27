import { Injectable } from '@angular/core';
import { AddAuditService } from '../add-audit-service';

@Injectable({
  providedIn: 'root',
})
export class ReasonService {
  constructor(private addAuditService: AddAuditService) {}



   AddReason(reason: string, action: string,auditingUser:number,auditedBy:number) 
  {
    console.log('Reason for deactivation:', reason);

    const auditData = {
      reason: reason, // Replace with actual user ID
    action: action,
    };
   
    this.addAuditService.addAudit(auditData,auditingUser,auditedBy ).subscribe({
      next: (res) => {
        alert("Audit added successfully") ;
        console.log('Audit added successfully:', res);
      },
      error: (err) => {
        console.error('Error adding audit:', err.message);
      },
    });


    
  }
}
