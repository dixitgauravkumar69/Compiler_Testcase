import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BASE_URL } from '../../Environments/environment';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class FindJobInfo {
  constructor(private http:HttpClient)
  {

  }


  findStudentProfile(userId:number):Observable<any>
  {
    return this.http.get(`${BASE_URL}/api/student/Profile/${userId}`);
  }

  getJobViaSemAndBranch(semester:number,branch:string):Observable<any[]>
  {
     return this.http.get<any[]>(`${BASE_URL}/placement/getJobInfo/${semester}/${branch}`)
  }

}
