import { Routes } from '@angular/router';
import { PersonalInfoComponent } from './features/personal-info/personal-info.component';
import { LoginComponent } from './features/auth/login/login.component';
import { authGuard } from './guards/auth.guard';
import { loginGuard } from './guards/login.guard';
import { PaymentComponent } from './features/payment/payment.Component';
import { applicationLockGuard } from './guards/application-lock-guard';
import { ForgotPasswordComponent } from './features/forgot-password/forgot-password.component';
import { PaymentSuccessComponent } from './features/payment-success/payment-success.component';
import { PaymentFailureComponent } from './features/payment-failure/payment-failure.component';

export const routes: Routes = [

  // ✅ HOME
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component').then(
        (m) => m.HomeComponent
      ),
    // canActivate: [authGuard]
  },

  // ✅ LOGIN
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent
      ),

  },

  // ✅ REGISTRATION
  {
    path: 'registration',
    loadComponent: () =>
      import('./features/auth/registration/registration.component').then(
        (m) => m.RegistrationComponent
      ),
  },

  // ✅ PERSONAL INFO
  {
    path: 'personal-info',
    component: PersonalInfoComponent,
    canActivate: [authGuard],
  },

  // ✅ APPLICATION PREVIEW  🔥🔥🔥 (THIS WAS MISSING)
  {
    path: 'application-preview',
    loadComponent: () =>
      import('./features/application-preview/application-preview.component')
        .then(m => m.ApplicationPreview),
    canActivate: [authGuard, applicationLockGuard],
  },

  {
    path: 'payment',
    component: PaymentComponent,
    canActivate: [authGuard] // ONLY auth guard
  },

  {
    path: 'forgot-password',
    component: ForgotPasswordComponent
  },

  {
    path: 'payment-success',
    component: PaymentSuccessComponent
  },

  {
    path: 'payment-failure',
    component: PaymentFailureComponent
  }


];
