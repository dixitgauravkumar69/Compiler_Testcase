import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BASE_URL } from '../../../Environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  constructor(private http:HttpClient){}
  
  getUser(email:string):Observable<any>
  {
    return this.http
      .get(`${BASE_URL}/api/User/profile?email=` + email);
  }


  uploadImg(userId:number,formdata:any)
  {
    return this.http.post(`${BASE_URL}/api/student/uploadImg/${userId}`, formdata)
  }

  
  fetchProfileByUserId(userId:number)
  {
    return this.http
    .get(`${BASE_URL}/api/student/Profile/` + userId)
  }


  updateProfile(userId:number,profileId:number)
  {
    return this.http
    .post(`${BASE_URL}/api/student/addProfile/` + userId, profileId)
  }


}
