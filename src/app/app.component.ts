import { Component, HostListener, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { SessionTimeoutService } from './services/session-timeout.service'; // ✅ ADD


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {

  isLoggedIn = false; // ✅ already present

  constructor(
    private router: Router,
    private sessionService: SessionTimeoutService // ✅ ADD
  ) {
    // ✅ Track login state for header/footer
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.isLoggedIn = !!localStorage.getItem('token');
      });
  }

  ngOnInit() {
    const token = localStorage.getItem('token');
    const applicationStatus = localStorage.getItem('applicationStatus');

    if (token) {
      // Start session timeout
      this.sessionService.startSession();

      // Redirect based on application status
      if (applicationStatus === 'PAID') {
        this.router.navigate(['/application-preview']);
      } else if (applicationStatus === 'SUBMITTED') {
        this.router.navigate(['/payment']);
      }
      // else DRAFT → stay on editable page
    }
  }

  // 🔥 RESET SESSION ON USER ACTIVITY
  @HostListener('document:mousemove')
  @HostListener('document:keydown')
  @HostListener('document:click')
  @HostListener('document:scroll')
  onUserActivity() {
    if (localStorage.getItem('token')) {
      // this.sessionService.resetSession();
    }
  }
}
