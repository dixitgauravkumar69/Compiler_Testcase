import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-log-out',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './log-out.html',
  styleUrls: ['./log-out.css']
})
export class LogOut implements OnInit {

  done = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.logout();
  }

  logout() {

    localStorage.removeItem("JWT_TOKEN");
    localStorage.removeItem("Usermail");
    localStorage.removeItem("UserId");
    localStorage.removeItem("Semester");

    setTimeout(() => {
      this.done = true;
    }, 1500);

    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 2500);
  }
}