import { Component } from '@angular/core';
import { TeacherSidebar } from '../../teacher-sidebar/teacher-sidebar';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-code-simiplarity',
  imports: [TeacherSidebar, CommonModule],
  templateUrl: './code-simiplarity.html',
  styleUrl: './code-simiplarity.css',
})
export class CodeSimiplarity {


constructor(private router: Router) {}

  activeSection = 'see';
  activeTab='';
  isLoading = false;
  showLiveModal = false;
  selectedProblemId: number = 0;
  solvedStudents: any[] = [];
  isSidebarOpen = false;


  liveStream(id: number) { this.selectedProblemId = id; this.showLiveModal = true; }
  toggleSidebar() { this.isSidebarOpen = !this.isSidebarOpen; }
  closeSidebar() { this.isSidebarOpen = false; }
  goToAddStatement() { this.router.navigate(['/Statement']); }
  goToAddCampus() { this.router.navigate(['/campusAdd']); }
  logout() { localStorage.clear(); this.router.navigate(['/auth']); }



}
