import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BASE_URL } from '../../../Environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UpdateStatus {

  constructor(private http: HttpClient) {}

  updateStatus(id: number, status: any) {
    return this.http.put(`${BASE_URL}/api/admin/changeStatus/${id}`, status, { responseType: 'text' });
  }
}
