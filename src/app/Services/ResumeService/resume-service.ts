import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BASE_URL } from '../../../Environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ResumeService {

  constructor(private http:HttpClient){}
  
  fetchUser(email:string):Observable<any>
  {
    return this.http
          .get(`${BASE_URL}/api/User/profile?email=` + email);
  }



  loadProfile(userId:number):Observable<any>
  {
    return this.http
      .get(`${BASE_URL}/api/student/Profile/` + userId) ;
  }


  addResume(userId:number,userinfo:any):Observable<any>
  {
    return this.http.post(`${BASE_URL}/api/student/addResumeInfo/` + userId, userinfo);
  }

  getResume(userId:number):Observable<any>
  {
    return this.http.get(`${BASE_URL}/api/student/getResume/` + userId)
  }

  downLoadResume(resumeId:number):Observable<any>
  {
    return this.http.get(`${BASE_URL}/api/student/downloadResume/${resumeId}`, { responseType: 'blob' })
  }
}
