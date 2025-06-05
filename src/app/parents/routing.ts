import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { OrderComponent } from './order/order.component';
import { CartComponent } from './cart/cart.component';
import { OrderDetailComponent } from './order-detail/order-detail.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { AuthGuard } from '../modules/auth/services/auth.guard';

const Routing: Routes = [
  {
    path: 'home',
    component: LandingPageComponent
  },
  {
    path:'browse',
    component:HomeComponent
  },
  {
    path:'my-orders',
    canActivate: [AuthGuard],
    component:OrderComponent
  },
  {
    path: 'order/:id',
    canActivate: [AuthGuard],
    component: OrderDetailComponent
  },
  {
    path:'cart',
    canActivate: [AuthGuard],
    component:CartComponent
  },
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'error/404',
  },

];

export { Routing };
