import { Component,OnInit,ViewChild,ElementRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeacherSidebar } from '../../teacher-sidebar/teacher-sidebar';
import { Router } from '@angular/router';
import { AnalysisStudentService } from '../../../Services/AnalysisService/analysis-student-service';
import { Chart, registerables } from 'chart.js';
import { ChangeDetectorRef } from '@angular/core';



Chart.register(...registerables);

@Component({
  selector: 'app-analysis-component',
  standalone: true,
  imports: [CommonModule, TeacherSidebar],
  templateUrl: './analysis-component.html',
  styleUrl: './analysis-component.css',
})
export class AnalysisComponent implements OnInit {

  //  ViewChild references (canvas)
  @ViewChild('semesterChartCanvas', { static: false }) semesterChartRef!: ElementRef;
  @ViewChild('reasonChartCanvas', { static: false }) reasonChartRef!: ElementRef;

  activeSection = 'see';
  isLoading = false;
  showLiveModal = false;

  selectedProblemId: number = localStorage.getItem("SelectedProblemId")
    ? Number(localStorage.getItem("SelectedProblemId"))
    : 0;

  isSidebarOpen = false;
  studentData: any = null;

  semesterChart: any;
  reasonChart: any;

  // Prevent multiple renders
  chartInitialized = false;

  constructor(
    private router: Router,
    private analysisStudentService: AnalysisStudentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchAnalytics();
  }

 
  // ================= API =================

  fetchAnalytics() {
    this.isLoading = true;

    this.analysisStudentService
      .findAnaliticsByProblemId(this.selectedProblemId)
      .subscribe({
        next: (data) => {
          console.log("Backend Data:", data);

          this.studentData = data;
          this.isLoading = false;

          this.cdr.detectChanges(); //view phle render ho jaye uske baad chart render karna hai isliye detectChanges call kiya hai

          // Trigger chart after render
          setTimeout(() => this.tryInitCharts());
        },
        error: (err) => {
          console.error('Error fetching analytics:', err);
          this.isLoading = false;
        }
      });
  }

  // ================= CHART INIT =================

  private tryInitCharts() {
    if (
      this.chartInitialized ||
      !this.studentData ||
      !this.semesterChartRef ||
      !this.reasonChartRef
    ) return;

    this.createSemesterChart();
    this.createReasonChart();

    this.chartInitialized = true; // for avoiding duplicate chart creation
  }

  // ================= CHARTS =================

  createSemesterChart() {
    if (!this.studentData?.countOfSubmitionOnSemester) return;

    const ctx = this.semesterChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = this.studentData.countOfSubmitionOnSemester.map(
      (item: any) => `Sem ${item[0]}`
    );

    const values = this.studentData.countOfSubmitionOnSemester.map(
      (item: any) => item[1]
    );

    if (!values.length) return;

    if (this.semesterChart) {
      this.semesterChart.destroy();
    }

    this.semesterChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Submissions',
          data: values,
          backgroundColor: '#4f46e5',
          borderRadius: 5
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        }
      }
    });
  }

  createReasonChart() {
    if (!this.studentData?.countOfSubmitionOnReason) return;

    const ctx = this.reasonChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = this.studentData.countOfSubmitionOnReason.map((item: any) =>
      item[0]?.includes("Focus Lost") ? "Focus Lost" : "Tab Switch"
    );

    const values = this.studentData.countOfSubmitionOnReason.map(
      (item: any) => item[1]
    );

    if (!values.length) return;

    if (this.reasonChart) {
      this.reasonChart.destroy();
    }

    this.reasonChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }

  // ================= UI =================

  liveStream(id: number) {
    this.selectedProblemId = id;
    this.showLiveModal = true;
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar() {
    this.isSidebarOpen = false;
  }

  goToAddStatement() {
    this.router.navigate(['/Statement']);
  }

  goToAddCampus() {
    this.router.navigate(['/campusAdd']);
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/logout']);
  }
}