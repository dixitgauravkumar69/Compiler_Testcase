import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BASE_URL } from '../../../Environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GetApprovalRequests {
  constructor(private http:HttpClient){}

  getApprovalRequests(){
    return this.http.get<any[]>(`${BASE_URL}/api/admin/getApprovalRequests`);
  }

}
