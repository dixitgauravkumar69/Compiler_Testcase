import { Component, OnInit } from '@angular/core';
import { TeacherSidebar } from '../../teacher-sidebar/teacher-sidebar';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CodeSimilarity } from '../../../Services/CodeSimilarity/code-similarity';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-code-simiplarity',
  imports: [TeacherSidebar, CommonModule],
  templateUrl: './code-simiplarity.html',
  styleUrl: './code-simiplarity.css',
})
export class CodeSimiplarity implements OnInit {


constructor(private router: Router, private codeSimilarity: CodeSimilarity,private cdr: ChangeDetectorRef)  {}

  activeSection = 'see';
  activeTab='';
  isLoading = false;
  showLiveModal = false;
  selectedProblemId: number = 0;
  solvedStudents: any[] = [];
  isSidebarOpen = false;


 studentId=localStorage.getItem("SelectedStudentId") ? parseInt(localStorage.getItem("SelectedStudentId")!) : 0;
 problemId=localStorage.getItem("SelectedProblemId") ? parseInt(localStorage.getItem("SelectedProblemId")!) : 0;


 //Ab student id le li to ab ise local se remove kr le rha hu kyuki agli bar click kia to phir same na aae


  ngOnInit(): void {
    

   

     this.codeSimilarity.getSimilarity(this.studentId, this.problemId).subscribe(
      (response: any) => {
        this.solvedStudents = response;
          this.cdr.detectChanges();
        console.log('Similarity data:', this.solvedStudents);
      },
      (error:any) => {
        console.error('Error fetching similarity data:', error);
      }
    );
  }
 


  





  liveStream(id: number) { this.selectedProblemId = id; this.showLiveModal = true; }
  toggleSidebar() { this.isSidebarOpen = !this.isSidebarOpen; }
  closeSidebar() { this.isSidebarOpen = false; }
  goToAddStatement() { this.router.navigate(['/Statement']); }
  goToAddCampus() { this.router.navigate(['/campusAdd']); }
  logout() { localStorage.clear(); this.router.navigate(['/auth']); }



}
