import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-notification-component',
  standalone:true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './notification-component.html',
  styleUrl: './notification-component.css',
})
export class NotificationComponent implements OnInit {

  constructor(private cdr:ChangeDetectorRef)
  {

  }



  myList:any=[];


  ngOnInit(): void {
      this.myList = history.state.myList;
      console.log(this.myList);
        this.isNotificationOpen = true; 
      this.cdr.detectChanges();
  }

  isNotificationOpen: boolean = false;

openNotifications() {
  this.isNotificationOpen = true;
  this.cdr.detectChanges();
}

closeNotifications() {
  this.isNotificationOpen = false;
  this.cdr.detectChanges();
}

}
