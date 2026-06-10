import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {

  mobile: string = '';
  otp: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  showPassword = false;
  otpSent = false;
  otpVerified = false;
  otpTimer: number = 60;
  otpExpired = false;
  timerInterval: any;

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private router: Router
  ) { }

  // 🔥 STEP 1: Send OTP
  sendOtp() {


    // ✅ Mobile validation
    if (!/^[0-9]{10}$/.test(this.mobile)) {
      this.toastr.error('Enter valid 10-digit mobile number');
      return;
    }

    const payload = {
      mobile: this.mobile.trim(),
      type: 'forgot'
    };

    this.http.post('http://localhost:4000/api/auth/send-otp', payload)
      .subscribe({
        next: () => {
          this.toastr.success('OTP sent successfully');
          this.otpSent = true;
          this.otpVerified = false;
          this.startOtpTimer();

        },
        error: (err) => {
          console.error(err);
          this.toastr.error(err?.error?.message || 'Failed to send OTP');
        }
      });
  }

  // 🔥 STEP 2: Verify OTP
  verifyOtp() {

    if (this.otpExpired) {
      this.toastr.error('OTP expired. Please resend.');
      return;
    }

    if (!this.otp) {
      this.toastr.warning('Enter OTP');
      return;
    }

    const payload = {
      mobile: this.mobile.trim(),
      otp: this.otp,
      type: 'forgot'
    };

    this.http.post('http://localhost:4000/api/auth/verify-otp', payload)
      .subscribe({
        next: () => {
          // ✅ STOP TIMER HERE
          clearInterval(this.timerInterval);
          this.toastr.success('OTP verified');
          this.otpVerified = true;
          this.otpSent = false;
          this.otp = '';  // ✅ Security improvement
        },
        error: (err) => {
          console.error(err);
          this.toastr.error(err?.error?.message || 'Invalid OTP');
        }
      });
  }

  // 🔥 STEP 3: Reset Password
  resetPassword() {

    if (!this.otpVerified) {
      this.toastr.error('Please verify OTP first');
      return;
    }

    const passwordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!this.newPassword) {
      this.toastr.error('Password is required');
      return;
    }

    if (!passwordPattern.test(this.newPassword)) {
      this.toastr.error('Password must include uppercase, lowercase, number & special character');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.toastr.error('Passwords do not match');
      return;
    }

    const payload = {
      mobile: this.mobile.trim(),
      newPassword: this.newPassword.trim()
    };

    this.http.post('http://localhost:4000/api/auth/reset-password', payload)
      .subscribe({
        next: () => {
          clearInterval(this.timerInterval);

          // ✅ Reset all fields
          this.mobile = '';
          this.otp = '';
          this.newPassword = '';
          this.confirmPassword = '';

          this.otpSent = false;
          this.otpVerified = false;
          this.otpExpired = false;
          this.otpTimer = 60;

          this.toastr.success('Password successfully updated');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error(err);
          this.toastr.error(err?.error?.message || 'Failed to reset password');
        }
      });
  }

  // 👁️ Toggle password
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  startOtpTimer() {
    this.otpTimer = 60;
    this.otpExpired = false;

    clearInterval(this.timerInterval);

    this.timerInterval = setInterval(() => {
      if (this.otpTimer > 0) {
        this.otpTimer--;
      } else {
        clearInterval(this.timerInterval);
        this.otpExpired = true;
      }
    }, 1000);
  }

  resendOtp() {
    this.otp = '';
    this.otpExpired = false;
    this.sendOtp();
  }
}