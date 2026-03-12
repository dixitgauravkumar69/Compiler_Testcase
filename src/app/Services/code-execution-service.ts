import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BASE_URL } from '../../Environments/environment';
export interface RunCodeRequest {
  code: string;
  language: string;
  problemId:number;
}

@Injectable({
  providedIn: 'root'
})
export class CodeExecutionService {

  private baseUrl = `${BASE_URL}/api/code`; 

  constructor(private http: HttpClient) { }

  runCode(code: string, language: string,problemId:number): Observable<string> {
    const payload: RunCodeRequest = { code, language,problemId };
    return this.http.post(
  `${this.baseUrl}/runTestCases`,
  payload,
  {
    responseType: 'text', 
    withCredentials: true 
  }
);
  }
}