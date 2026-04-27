import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BASE_URL } from '../../Environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AddAuditService {
  constructor(private http: HttpClient) {}

  addAudit(auditData: any, auditId: number, userId: number) {
    return this.http.post(`${BASE_URL}/api/User/addAudit/${auditId}/${userId}`, auditData, { responseType: 'text' });
}

}