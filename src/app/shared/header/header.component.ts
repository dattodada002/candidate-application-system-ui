import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { SessionTimeoutService } from '../../services/session-timeout.service'; // ✅ ADD

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {

  isLoggedIn = false;

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private sessionService: SessionTimeoutService // ✅ ADD
  ) { }

  ngOnInit(): void {
    // ✅ SET LOGIN STATE IMMEDIATELY
    this.isLoggedIn = !!localStorage.getItem('token');

    // ✅ UPDATE ON ROUTE CHANGE
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.isLoggedIn = !!localStorage.getItem('token');
      });
  }

logout() {
  const confirmLogout = confirm('Are you sure you want to logout?');

  if (!confirmLogout) {
    this.toastr.info('Logout cancelled', 'Info');
    return;
  }

  // 🔥 STOP SESSION TIMERS FIRST
  this.sessionService.clearTimers();

  // 🔐 CLEAR STORAGE
  localStorage.removeItem('token');
  localStorage.removeItem('APP_NO');
  this.isLoggedIn = false;
  this.toastr.success('Logged out successfully', 'Logout');

  // 🚫 Prevent SessionTimeoutService logout toast
  this.router.navigate([''], { replaceUrl: true });
}
  goHome() {
    this.router.navigate(['/']);
  }
}
