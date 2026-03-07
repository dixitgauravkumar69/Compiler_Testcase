import { Component } from '@angular/core';
import { CodeExecutionService } from '../../Services/code-execution-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-code-runner',
  standalone:true,
  imports:[CommonModule,ReactiveFormsModule,FormsModule],
  templateUrl: './code-execution.html',
  styleUrls: ['./code-execution.css']
})
export class CodeExecution {
  code: string = '';
  language: string = 'JAVA';
  output: string = '';

  languages = ['JAVA', 'PYTHON', 'CPP'];
  problemId:number=Number(localStorage.getItem("ProblemId"));

  constructor(private api: CodeExecutionService,
    private cdr:ChangeDetectorRef
  ) { }

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