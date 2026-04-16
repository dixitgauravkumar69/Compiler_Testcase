import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BASE_URL } from '../../Environments/environment';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root',
})
export class GetStoredNotificationService {

  //constructor
  
   constructor(private http:HttpClient, )
   {

   }

  getNotification(userId: number): Observable<any> {
    return this.http.get(`${BASE_URL}/sse/getNotification/${userId}`);
  }



}
