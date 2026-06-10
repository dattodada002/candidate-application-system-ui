import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {

  constructor(private router: Router) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');

    if (token) {
      // If already logged in → redirect
      this.router.navigate(['/personal-info']);
    }
  }

  // goToLogin() {
  //   this.router.navigate(['/login']);
  // }

  // goToRegister() {
  //   this.router.navigate(['/registration']);
  // }

}