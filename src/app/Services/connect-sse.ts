import { Injectable } from '@angular/core';
import { BASE_URL } from '../../Environments/environment';

@Injectable({
  providedIn: 'root',

})
export class ConnectSSE {

  private eventSource!: EventSource;

connectSSE() {
  const userId = localStorage.getItem('UserId');
  console.log(userId);

  if (!userId) return;

  //  avoid multiple connections
  if (this.eventSource) {
    this.eventSource.close();
  }

  this.eventSource = new EventSource(
    `${BASE_URL}/sse/subscribe/${userId}`
  );

  this.eventSource.onmessage = (event) => {
    console.log("Notification:", event.data);


    try {
      const data = JSON.parse(event.data);
      alert(data.message);
    } catch {
      alert(event.data);
    }
  };

  this.eventSource.onerror = (error) => {
    console.log("SSE Error:", error);

    this.eventSource.close();

    //  auto reconnect after 3 sec
    setTimeout(() => {
      console.log("Reconnecting SSE...");
      this.connectSSE();
    }, 3000);
  };
}
}
