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
  step = 0;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.runLogout();
  }

  runLogout() {
    // Animate steps
    setTimeout(() => { this.step = 1; }, 300);
    setTimeout(() => { this.step = 2; }, 800);
    setTimeout(() => {
      this.step = 3;
      // Clear session
      localStorage.removeItem('JWT_TOKEN');
      localStorage.removeItem('Usermail');
      localStorage.removeItem('UserId');
      localStorage.removeItem('Semester');
    }, 1300);

    // Show success
    setTimeout(() => {
      this.done = true;
    }, 1800);

    // Redirect
    setTimeout(() => {
      this.router.navigate(['/auth']);
    }, 3800);
  }
}
