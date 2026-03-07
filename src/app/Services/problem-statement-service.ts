import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProblemStatementService {
  private baseUrl = 'http://localhost:8080/api/faculty';

  constructor(private http: HttpClient) {}

  addProblem(statement: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/addProblemStatement`, statement, { responseType: 'text',withCredentials:true });
  }
}