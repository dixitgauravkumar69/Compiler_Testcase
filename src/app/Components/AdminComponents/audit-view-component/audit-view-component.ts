import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AdminSidebar } from '../admin-sidebar/admin-sidebar';
import { AuditView } from '../../../Services/AuditView/audit-view';
import{CustomDatePipe} from '../../../pipes/custom-date-pipe';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-audit-view-component',
  imports: [AdminSidebar, CustomDatePipe, CommonModule],
  templateUrl: './audit-view-component.html',
  styleUrl: './audit-view-component.css',
})
export class AuditViewComponent implements OnInit {
   isSidebarOpen = false;
   auditData: any[] = [];
   isLoading = false;


   constructor(private auditView: AuditView,
    private cdr: ChangeDetectorRef
   ){ }

// Jab page load hoga tab hi data manga lunga 
   ngOnInit() {
     this.getActionData();
   }


   
   getActionData()
   {
      this.isLoading = true;
    this.auditView.getAuditData().subscribe(
      (data) => {
        console.log('Audit Data:', data);
        this.auditData = data;
        this.isLoading = false;

        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error fetching audit data:', error);
      }
    );
   }


   
}
