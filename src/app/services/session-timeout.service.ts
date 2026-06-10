import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class SessionTimeoutService {
  private logoutTimer: any;
  private warningTimer: any;

  constructor(
    private router: Router,
    private toastr: ToastrService
  ) {}

  /** Start session based on JWT expiry */
  startSession() {
    this.clearTimers();

    const token = localStorage.getItem('token');
    if (!token) return;

    const decoded: any = jwtDecode(token);

    const expiryTime = decoded.exp * 1000;
    const currentTime = Date.now();
    const remainingTime = expiryTime - currentTime;

    // ⚠ Warn 30 seconds before expiry
    const warningTime = remainingTime - 30_000;

    if (warningTime > 0) {
      this.warningTimer = setTimeout(() => {
        this.toastr.warning(
          'Your session will expire in 30 seconds!',
          'Session Warning'
        );
      }, warningTime);
    }

    // 🚪 Auto logout at expiry
    if (remainingTime > 0) {
      this.logoutTimer = setTimeout(() => {
        this.logout();
      }, remainingTime);
    }
  }

  /** Logout user */
  logout() {
    this.clearTimers();
    localStorage.clear();
    this.toastr.error(
      'Session expired. Please login again4.',
      'Session Expired'
    );
    this.router.navigate(['/']);
  }

  /** Clear timers */
  clearTimers() {
    if (this.logoutTimer) clearTimeout(this.logoutTimer);
    if (this.warningTimer) clearTimeout(this.warningTimer);
  }
}
