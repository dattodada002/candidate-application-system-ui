import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError, of } from 'rxjs';

export const applicationLockGuard: CanActivateFn = () => {

  const http = inject(HttpClient);
  const router = inject(Router);

  return http.get<any>('http://localhost:4000/api/application')
    .pipe(

      map(res => {

        // ❌ No application
        if (!res?.data) {
          router.navigate(['/personal-info']);
          return false;
        }



        // ✅ Paid → allow preview
        return true;

      }),

      catchError(() => {

        router.navigate(['/personal-info']);
        return of(false);

      })

    );
};