import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeSwitcher } from '../theme-switcher/theme-switcher';

@Component({
  selector: 'app-student-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, ThemeSwitcher],
  templateUrl: './student-sidebar.html',
  styleUrls: ['./student-sidebar.css']
})
export class StudentSidebar {
  @Input() pageTitle = 'Dev Campus';
  @Input() isOpen = false;
  @Output() toggle = new EventEmitter<void>();
  @Output() close  = new EventEmitter<void>();
}
