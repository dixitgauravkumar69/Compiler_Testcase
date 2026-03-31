import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BASE_URL } from '../../Environments/environment';

@Injectable({ providedIn: 'root' })
export class ProblemStatementService {


  // private baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

   

  addProblem(statement: string,title:string,level:string): Observable<any> {
    return this.http.post(`${BASE_URL}/api/faculty/addProblemStatement`, {statement,title,level}, { responseType: 'text',withCredentials:true });
  }
}