import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css'],
})
export class RegistrationComponent implements OnInit {

  registrationForm: FormGroup;
  errorMsg = '';

  showPassword = false;
  showConfirmPassword = false;

  otpSent = false;
  verifyingOtp = false;
  otpVerified = false;

  otpTimer: number = 60;
  timerInterval: any;
  otpExpired: boolean = false;

  years: number[] = [2026];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.registrationForm = this.fb.group({
      year: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(12), Validators.pattern(
        '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&]).{8,}$'
      )]],
      confirmPassword: ['', Validators.required],

      otp: [''],
      otpVerified: [false],
    }, { validators: this.passwordMatchValidator });

    this.registrationForm.valueChanges.subscribe(() => {
      this.errorMsg = '';
    });
  }

  // ✅ ADD HERE
  ngOnInit(): void {
    this.registrationForm.get('password')?.valueChanges.subscribe(value => {
      if (value) {
        this.registrationForm.get('password')?.setValue(value.trim(), { emitEvent: false });
      }
    });
  }
  // 🔐 Password match validator
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirm = form.get('confirmPassword')?.value;

    if (!password || !confirm) return null;
    
    return password === confirm ? null : { passwordMismatch: true };
  }

  get f() {
    return this.registrationForm.controls;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // 📩 SEND OTP
  sendOtp() {
    if (this.f['email'].invalid || this.f['mobile'].invalid) {
      this.registrationForm.markAllAsTouched();
      this.toastr.warning('Enter valid Email and Mobile Number');
      return;
    }
    const payload = {
      mobile: this.f['mobile'].value,
      type: 'register'   // 🔥 VERY IMPORTANT
    };

    console.log('Send OTP Payload:', payload);

    this.http.post('http://localhost:4000/api/auth/send-otp', payload)
      .subscribe({
        next: () => {
          this.otpSent = true;
          this.startOtpTimer();
          this.f['mobile'].disable();
          this.f['email'].disable();
          this.toastr.success('OTP sent successfully');
        },
        error: (err) => {
          console.error(err);
          this.toastr.error(err?.error?.message || 'Failed to send OTP');

          // const msg = err?.error?.message || 'Failed to send OTP';
          // this.toastr.error(msg);


        }
      });
  }

  resendOtp() {
    const payload = {
      mobile: this.registrationForm.getRawValue().mobile,
      type: 'register'
    };

    this.http.post('http://localhost:4000/api/auth/send-otp', payload)
      .subscribe({
        next: () => {
          this.otpSent = true;
          this.otpExpired = false;
          this.f['otp'].setValue('');
          this.startOtpTimer();
          this.toastr.success('OTP resent successfully');
        },
        error: () => {
          this.toastr.error('Failed to resend OTP');
        }
      });
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

  // ✅ VERIFY OTP
  verifyOtp() {

    if (this.otpExpired) {
      this.toastr.error('OTP expired. Please resend.');
      return;
    }

    if (!this.f['otp'].value) {
      this.toastr.warning('Enter OTP');
      return;
    }

    const payload = {
      mobile: this.registrationForm.getRawValue().mobile,
      otp: this.f['otp'].value,
      type: 'register'   // 🔥 VERY IMPORTANT
    };

    this.http.post('http://localhost:4000/api/auth/verify-otp', payload)
      .subscribe({
        next: () => {
          this.f['otpVerified'].setValue(true);
          clearInterval(this.timerInterval);
          this.toastr.success('OTP verified');
        },
        error: () => {
          this.toastr.error('Invalid OTP');
        }
      });
  }

  // 📝 REGISTER
  onSubmit() {
    this.registrationForm.markAllAsTouched();

    if (this.registrationForm.invalid) {
      this.toastr.warning('Please fill all required fields');
      return;
    }

    if (!this.f['otpVerified'].value) {
      this.toastr.error('Please verify OTP before registration');
      return;
    }

    const payload = {
      reg_year: this.f['year'].value,
      email: this.f['email'].value,
      mobile: this.f['mobile'].value,
      password: this.f['password'].value.trim(),
    };

    this.http.post('http://localhost:4000/api/auth/register', payload)
      .subscribe({
        next: (res: any) => {
          const appNo = res.APP_NO;
          this.otpSent = false;  // ✅ Reset OTP flow after successful registration
          this.f['otpVerified'].setValue(false);
          this.f['otp'].setValue('');
          clearInterval(this.timerInterval);
          this.toastr.success(
            `Registration successful! Registration No: ${appNo}`,
            'Success',
            {
              timeOut: 120000,
              extendedTimeOut: 120000,
              tapToDismiss: false,
              closeButton: true,
              progressBar: true,
              disableTimeOut: false
            }

          );

          // alert(
          //   `Registration successful!\n\nRegistration Number:\n${appNo}`
          // );

          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.errorMsg = err?.error?.message || 'Registration failed';
          this.toastr.error(this.errorMsg);

          // const msg = err?.error?.message || 'Failed to send OTP';
          // this.toastr.error(msg);

          // ✅ Re-enable fields for correction
          this.f['email'].enable();
          // this.f['mobile'].enable();

          // ✅ Reset OTP flow because email/mobile changed
          this.otpSent = true;

          // this.f['otp'].setValue('');
          // this.f['otpVerified'].setValue(false);

          setTimeout(() => {
            (document.querySelector(
              'input[formControlName="email"]'
            ) as HTMLInputElement)?.focus();
          }, 30);
        }
      });
  }
}
