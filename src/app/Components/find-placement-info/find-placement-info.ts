import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BASE_URL } from '../../../Environments/environment';

@Component({
  selector: 'app-find-placement-info',
  standalone:true,
  imports: [CommonModule],
  templateUrl: './find-placement-info.html',
  styleUrl: './find-placement-info.css',
})
export class FindPlacementInfo {
  jobs:any[] = [];

  constructor(private http:HttpClient, private router:Router,private cdr:ChangeDetectorRef){}

  ngOnInit(): void {

    this.http.get<any[]>(`${BASE_URL}/placement/getJobInfo/6`)
    .subscribe(res=>{
      this.jobs = res;
      this.cdr.detectChanges();
    })

  }

  viewDescription(id:number){
    this.router.navigate(['/jobDescription',id]);
    console.log(id);
  }

}
