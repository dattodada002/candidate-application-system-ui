import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  constructor(private http: HttpClient, private router: Router, private toastr: ToastrService) {}

  createOrder() {
    return this.http.post('http://localhost:4000/api/payment/create-order', {});
  }

  verifyPayment(payload: any) {
    return this.http.post('http://localhost:4000/api/payment/verify', payload);
  }

  /** Save login application status */
  saveApplicationStatus(status: string) {
    localStorage.setItem('applicationStatus', status);
  }

  getApplicationStatus(): string | null {
    return localStorage.getItem('applicationStatus');
  }

  redirectAfterLogin() {
    const status = this.getApplicationStatus();
    if (status === 'PAID' || status === 'SUBMITTED') {
      this.router.navigate(['/application-preview']);
    } else {
      this.router.navigate(['/personal-info']);
    }
  }
}

