import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BASE_URL } from '../../../Environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuditView {
  constructor( private http: HttpClient){}

  getAuditData():Observable<any[]> {
    return this.http.get<any[]>(`${BASE_URL}/api/admin/view/actions`);
  }
}
