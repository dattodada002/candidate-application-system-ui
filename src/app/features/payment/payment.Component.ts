import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Location } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment.component.html',
})
export class PaymentComponent implements OnInit {
  applicationStatus: 'DRAFT' | 'SUBMITTED' | 'PAID' = 'DRAFT';
  appNo!: number;
  isProcessing = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastr: ToastrService,
    private location: Location,
    private cd: ChangeDetectorRef,
  ) { }



  ngOnInit(): void {
    // 1️⃣ Load profile to get APP_NO
    this.http.get<any>('http://localhost:4000/api/profile')
      .subscribe(res => {

        this.appNo = res.APP_NO;
        const status = localStorage.getItem('applicationStatus') as 'DRAFT' | 'SUBMITTED' | 'PAID';
        if (status) {
          this.applicationStatus = status;
        } else {
          // fallback: fetch from backend
          this.http.get<any>('http://localhost:4000/api/application')
            .subscribe(appRes => {
              if (appRes?.status) {
                this.applicationStatus = appRes.status;
                localStorage.setItem('applicationStatus', appRes.status);
              }
            });
        }
      });

  }


  goOnPriviespage(): void {
    this.router.navigate(['/application-preview']);

    // this.router.navigateByUrl('/application-form');
  }
  // ✅ FINAL PAYMENT FUNCTION

payNow(): void {
  if (this.isProcessing) return;

  this.isProcessing = true;

  const payload = {
    app_no: this.appNo,
    amount: 1,
    firstname: localStorage.getItem('full_name') || 'Candidate',
  };

  this.http.post<any>(
    'http://localhost:4000/api/payment/initiate',
    payload
  )
  .pipe(
    finalize(() => {
      setTimeout(() => {
        this.isProcessing = false;
        this.cd.detectChanges();
      });
    })
  )
  .subscribe({
    next: (res) => {
      const form = document.createElement('form');
      form.method = 'POST';
      // Testing url
      // form.action = 'https://testpay.easebuzz.in/pay/secure';
      form.action = 'https://pay.easebuzz.in/pay/secure';
          

      Object.keys(res).forEach(key => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = res[key];
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    },
    error: (err) => {
      this.toastr.error(err.error?.message || 'Unable to initiate payment');
    }
  });
}

}