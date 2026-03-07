import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TestCaseDTO {
  problemId: number;
  inputData: string;
  expectedOutput: string;
}

@Injectable({ providedIn: 'root' })
export class TestCaseService {
  private baseUrl = 'http://localhost:8080/api/testcase';

  constructor(private http: HttpClient) {}

  addTestCase(testCase: TestCaseDTO): Observable<any> {
    return this.http.post(`${this.baseUrl}/addTestCase`, testCase, { responseType: 'text',withCredentials:true });
  }
}