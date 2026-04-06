import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-access-denied',
  imports: [RouterLink
  ],
  templateUrl: './access-denied.html',
  styleUrl: './access-denied.css',
})
export class AccessDenied {
  constructor(private router:Router)
  {}

  goHome() {
  this.router.navigate(['/']);
}

goBack() {
  window.history.back();
}
}
