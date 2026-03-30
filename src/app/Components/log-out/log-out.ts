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
    // Remove user session
    localStorage.removeItem("JWT_TOKEN");
    localStorage.removeItem("Usermail");
    localStorage.removeItem("UserId");
    localStorage.removeItem("Semester");

    // Show success after 1.5s
    setTimeout(() => {
      this.done = true;
    }, 1500);

    // Redirect after 2.5s
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 2500);
  }
}