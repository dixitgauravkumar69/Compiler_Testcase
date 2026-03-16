import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { CodeExecutionService } from '../../Services/code-execution-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BASE_URL } from '../../../Environments/environment';

@Component({
  selector: 'app-code-runner',
  standalone:true,
  imports:[CommonModule,ReactiveFormsModule,FormsModule],
  templateUrl: './code-execution.html',
  styleUrls: ['./code-execution.css']
})
export class CodeExecution implements OnInit, OnDestroy {

  code: string = '';
  language: string = 'JAVA';
  output: string = '';

  title:string='';
  description:string='';
  input:string='';
  expectedOutput='';

  testCases:any[]=[];
  languages = ['JAVA', 'PYTHON', 'CPP'];
  problemId:number=Number(localStorage.getItem("ProblemId"));

  // TIMER
  minutes:number = 30; // Abhi static hai jb jarurat hogi teacher se le lenge dynamic way me.......
  seconds:number = 0;
  intervalId:any;

  marks:number=0;
  userid!:number;

  constructor(
    private api: CodeExecutionService,
    private cdr:ChangeDetectorRef,
    private http:HttpClient,
    private ngZone:NgZone
  ) { }

  ngOnInit(): void {

    // Problem Data
    this.http.get(`${BASE_URL}/api/code/getProblem/${this.problemId}`)
      .subscribe((data: any) => {
        this.title = data.title;
        this.description = data.problemStatement;
        this.cdr.detectChanges();
      });

    // Test Cases
    this.http.get(`${BASE_URL}/api/code/getTestCases/${this.problemId}`)
      .subscribe((data: any) => {
        this.testCases = data;
        this.input = data[0]?.inputData || '';
        this.expectedOutput = data[0]?.expectedOutput || '';
        this.cdr.detectChanges();
      });

    this.startTimer();   // TIMER START
  }

  startTimer() {
    if(this.intervalId){
      clearInterval(this.intervalId);
    }

    this.intervalId = setInterval(()=>{
      if(this.minutes === 0 && this.seconds === 0){
        clearInterval(this.intervalId);
        alert("⏰ Time Out");
        this.submitCode();
        return;
      }

      if(this.seconds === 0){
        this.minutes--;
        this.seconds = 59;
      } else {
        this.seconds--;
      }

      this.cdr.detectChanges();
    }, 1000);
  }

  runCode() {
    this.output = 'Running...';

    this.api.runCode(this.code, this.language, this.problemId).subscribe({
     next: (res: any) => {
  // Check karein agar res string hai toh parse karein
  let data = typeof res === 'string' ? JSON.parse(res) : res;   // response is in json string type

  console.log("PARSED DATA:", data);
  console.log("MARKS:", data.marks);

  if (data.testCases && Array.isArray(data.testCases)) {
    this.output = data.testCases.join('\n');
  }
  
  this.marks = data.marks ?? 0;
  this.cdr.detectChanges();
},
      error: (err) => {
        this.output = 'Error: ' + err.message;
        this.cdr.detectChanges();
      }
    });
  }

  submitCode() {
    clearInterval(this.intervalId);

    const totalTime = 30 * 60;
    const remainingTime = (this.minutes * 60) + this.seconds;
    const usedTime = totalTime - remainingTime;

    const usedMin = Math.floor(usedTime / 60);
    const usedSec = usedTime % 60;

    const timeString = `${usedMin.toString().padStart(2, '0')}:${usedSec.toString().padStart(2, '0')}`;


    console.log(timeString);

    const uId = Number(localStorage.getItem('UserId'));
    const pId = this.problemId;
    // 1. Data Object (Body) taiyar karein
    const body = {
        marks: this.marks,
        takenTime:timeString,
        userId:uId,
        problemId:pId
        
    };

    // 2. ID ko number mein convert karein aur check karein
    

    if (!uId || !pId) {
        alert("User ID ya Problem ID missing hai!");
        return;
    }

    console.log("Sending Data:", body);

    // 3. GET ki jagah POST use karein
    this.http.post(`${BASE_URL}/api/student/SaveStudentCodeInfo/${uId}/${pId}`, body, { responseType: 'text' })
      .subscribe({
        next: (data: any) => {
            alert("Success: " + data);
            this.cdr.detectChanges();
        },
        error: (err) => {
            console.error("Error:"+err);
            alert("Database mein save nahi ho paya!");
        }
      });

    alert(`Code Submitted Successfully\nMarks: ${this.marks}`);
}

  ngOnDestroy() {
    clearInterval(this.intervalId);   
  }
}