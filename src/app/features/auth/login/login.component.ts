import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { SessionTimeoutService } from '../../../services/session-timeout.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  
  loginForm: FormGroup;
  submitted = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private sessionService: SessionTimeoutService
  ) {
    // STOP any existing session timers
    this.sessionService.clearTimers();
    this.loginForm = this.fb.group({
      identifier: ['', [Validators.required, this.emailOrMobileValidator]],
      password: ['', Validators.required],
    });
  }

  ngOnInit(): void {}


  get f() {
    return this.loginForm.controls;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  emailOrMobileValidator(control: AbstractControl) {
    const value = control.value;
    if (!value) return null;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^[0-9]{10}$/;
    const appNoRegex = /^260[0-9]{5}$/; // 26000001+

    if (
      emailRegex.test(value) ||
      mobileRegex.test(value) ||
      appNoRegex.test(value)
    ) {
      return null;
    }

    return { invalid: true };
  }



  onSubmit() {


    this.submitted = true;

    if (this.loginForm.invalid) return;

    const identifier = this.f['identifier'].value;
    const password = this.f['password'].value;

    const loginPayload = {
      identifier: identifier,   // MUST be named "identifier"
      password: password,
    };

    const existingToken = localStorage.getItem('token');

    if (existingToken) {

      const confirmLogout = confirm(
        'Another user is already logged in. Do you want to logout and continue?'
      );

      if (!confirmLogout) {
        return;
      }

      localStorage.clear();
      sessionStorage.clear();
    }

    this.http
      .post('http://localhost:4000/api/auth/login', loginPayload)
      .subscribe({
        next: (res: any) => {
          // console.log('Login token:', res.token);  
          // add this log const token = localStorage.getItem('token');

          if (!res.token) {
            alert('Login failed. Invalid response.');
            return;
          }

          // Store token only
          localStorage.setItem('token', res.token);
          localStorage.setItem('APP_NO', res.APP_NO);
          // Store application status to use in redirect
          localStorage.setItem('applicationStatus', res.applicationStatus);
          // Start JWT-based session timer
          this.sessionService.startSession();

          if (res.applicationStatus === 'PAID') {
            // Payment done → go directly to preview
            this.router.navigate(['/application-preview']);
          } else if (res.applicationStatus === 'SUBMITTED') {
            // Submitted but not paid → go to payment page
            this.router.navigate(['/payment']);
          } else {
            // Draft → start editing
            this.router.navigate(['/personal-info']);
          }
        },
        error: (err) => {
          localStorage.clear();
          sessionStorage.clear();
          alert(err.error?.message || 'Login failed');
        },
      });
  }
}
