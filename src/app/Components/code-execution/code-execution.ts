import { Component, OnInit } from '@angular/core';
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
export class CodeExecution implements OnInit {
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

  constructor(private api: CodeExecutionService,
    private cdr:ChangeDetectorRef,
    private http:HttpClient
  ) { }


  ngOnInit(): void {
       this.http
      .get(`${BASE_URL}/api/code/getProblem/${this.problemId}` )
      .subscribe((data: any) => {

        console.log(data);
        this.title=data.title;
        this.description=data.problemStatement;


        this.cdr.detectChanges();

        console.log("Title:"+this.title);
        console.log("Description:"+this.description);

      });

      this.http
      .get(`${BASE_URL}/api/code/getTestCases/${this.problemId}` )
      .subscribe((data: any) => {

        console.log(data);
         
        this.testCases=data;
        
        this.input=data[0].inputData;//Have to be dynamic ......
        this.expectedOutput=data[0].expectedOutput;//same....


        this.cdr.detectChanges();

        console.log(this.input);
        console.log(this.expectedOutput);
      });

      
  }
  
  runCode() {
  this.output = 'Running...';

  this.api.runCode(this.code, this.language,this.problemId).subscribe({
    next: (res) => {
      this.output = res;        
      this.cdr.detectChanges();  
    },
    error: (err) => {
      this.output = 'Error: ' + err.message;
      this.cdr.detectChanges();  
    }
  });
}
}