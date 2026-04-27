import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BASE_URL } from '../../../Environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UpdateApprovement {
  constructor(private http:HttpClient) {}

  updateApprovement(id: number, status: boolean):Observable<any> {
   
    return this.http.put(`${BASE_URL}/api/admin/updateApproval/${id}/${status}`, {},{responseType: 'text'});
  }
}
