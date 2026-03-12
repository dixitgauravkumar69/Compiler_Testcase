import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BASE_URL } from '../../../Environments/environment';

@Component({
  selector: 'app-job-description',
  standalone:true,
  imports: [CommonModule],
  templateUrl: './job-description.html',
  styleUrl: './job-description.css',
})
export class JobDescription {
   job:any;

  constructor(private route:ActivatedRoute, private http:HttpClient,private cdr:ChangeDetectorRef){}

  ngOnInit(): void {

    const id = this.route.snapshot.paramMap.get('id');

    this.http.get(`${BASE_URL}/placement/student/job/${id}`)
    .subscribe(res=>{
      this.job = res;

      console.log(this.job.allocate);
      this.cdr.detectChanges();
    })

  }

getFileName(url: string): string {
    return url.split('/').pop() || 'attachment.pdf';
  }
   
}
