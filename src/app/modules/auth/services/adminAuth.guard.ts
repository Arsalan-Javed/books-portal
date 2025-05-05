import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router
} from '@angular/router';
import { AuthFirebaseService } from './auth.firebase.service';

@Injectable({ providedIn: 'root' })
export class AdminAuthGuard implements CanActivate {
  constructor(
    private authService: AuthFirebaseService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    const currentUser: any = this.authService.getCurrentUser();

    if (currentUser?.isAdmin) {
      return true;
    }

    return this.router.parseUrl('/home'); // or wherever you want to redirect
  }
}
