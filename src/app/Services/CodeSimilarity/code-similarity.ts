import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { B } from '@angular/cdk/keycodes';
import { BASE_URL } from '../../../Environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CodeSimilarity {
  constructor(private http: HttpClient) {}

  getSimilarity(teacherId: number, problemId: number): any {
    return this.http.get(
      `${BASE_URL}/api/teacher/getCodeSimilarity/${teacherId}/${problemId}`
    );
  }

  

}
