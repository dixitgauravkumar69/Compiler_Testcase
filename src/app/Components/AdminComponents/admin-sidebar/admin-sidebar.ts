import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive ,Router} from '@angular/router';
import { ThemeSwitcher } from '../../theme-switcher/theme-switcher';


@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, ThemeSwitcher],
  templateUrl: './admin-sidebar.html',
  styleUrl: './admin-sidebar.css',
})
export class AdminSidebar {

  constructor(private router: Router) {}
   
  @Input() pageTitle = 'Dev Campus';
  @Input() isOpen = false;
  @Output() toggle = new EventEmitter<void>();
  @Output() close  = new EventEmitter<void>();

  goToAdminHome() { this.router.navigate(['/admin']); }

}
