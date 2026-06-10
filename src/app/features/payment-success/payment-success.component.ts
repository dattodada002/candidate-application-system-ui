import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-success.component.html',
  styleUrl: './payment-success.component.css',
})
export class PaymentSuccessComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
    localStorage.setItem('applicationStatus', 'PAID');

    setTimeout(() => {
      this.router.navigate(['/application-preview']);
    }, 1500);
  }
}
