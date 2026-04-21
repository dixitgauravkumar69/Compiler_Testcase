import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { ThemeSwitcher } from '../theme-switcher/theme-switcher';

@Component({
  selector: 'app-teacher-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, ThemeSwitcher],
  templateUrl: './teacher-sidebar.html',
  styleUrls: ['./teacher-sidebar.css']
})
export class TeacherSidebar {

constructor(private router: Router) {}

  @Input() pageTitle   = 'Dev Campus';
  @Input() isOpen      = false;
  @Input() activeSection = '';

  @Output() toggle          = new EventEmitter<void>();
  @Output() close           = new EventEmitter<void>();
  @Output() sectionChange   = new EventEmitter<string>();
  @Output() goProblems      = new EventEmitter<void>();
  @Output() goAddStatement  = new EventEmitter<void>();
  @Output() goCampus        = new EventEmitter<void>();
  @Output() logoutClick     = new EventEmitter<void>();

  goToTeacherHome() { this.router.navigate(['/teacher']); } 
}
