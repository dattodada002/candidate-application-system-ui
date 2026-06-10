import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {

  const router = inject(Router);
  const toastr = inject(ToastrService);
  const token = localStorage.getItem('token');

  // 🔥 DO NOT attach token for auth APIs
  const isAuthRequest =
    req.url.includes('/api/auth/login') ||
    req.url.includes('/api/auth/register') ||
    req.url.includes('/api/auth/send-otp') ||
    req.url.includes('/api/auth/verify-otp');

  const authReq = (!isAuthRequest && token)
    ? req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    })
    : req;

  return next(authReq).pipe(
    catchError((error) => {

      console.error("❌ HTTP ERROR");
      console.error("URL:", req.url);
      console.error("STATUS:", error.status);
      console.error("ERROR:", error);

      // 🔐 Handle session expiry ONLY for protected APIs
      if (error.status === 401 && !isAuthRequest) {
        // 🔥 REQUIRED
        localStorage.removeItem('token')
        toastr.error('Session expired. Please login again3');
        setTimeout(() => {
          router.navigate(['/login']);
        }, 1000);
      }

      return throwError(() => error);
    })
  );
};
