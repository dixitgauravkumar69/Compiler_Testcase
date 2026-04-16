import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BASE_URL } from '../../Environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class MarkAsRead {
  //Basic constructor for variables value
  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  MarkAsRead(notificationId: number): Observable<any> {
    return this.http.post(`${BASE_URL}/sse/notification/markAsRead/${notificationId}`, {});
  }

  markAsRead(notifications: any) {
    console.log(`notification id is :${notifications.id}`);

    this.MarkAsRead(notifications.id).subscribe({
      next: (res) => {
        if (notifications.type == 'addedJob') {
          this.router.navigate(['findJobInfo']);
          console.log('findJobRoute is calling..');
        } else if (notifications.type == 'addedProblem') {
          console.log('added problem is calling');
          this.router.navigate(['student']);
        } else if (notifications.type == 'liveProblem') {
          console.log('Live problem is calling');
          this.router.navigate(['studentLive']);
        } else if (notifications.type.startsWith('updatedApplicationStatus')) {
          const campusId = notifications.type.replace('updatedApplicationStatus', '');

          console.log(campusId);

          this.router.navigate([`/jobDescription/${campusId}`]);
        }
      },
      error: (err) => {
        console.log(err.message);
      },
    });
  }
}
