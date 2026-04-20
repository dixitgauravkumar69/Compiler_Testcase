import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BASE_URL } from '../../../Environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AnalysisStudentService {

  constructor(private http: HttpClient) { }

  findAnaliticsByProblemId(problemId: number):Observable<any>{
    return this.http.get(`${BASE_URL}/api/teacher/getStudents/PerformanceAnalysis/${problemId}`);
  }
}
