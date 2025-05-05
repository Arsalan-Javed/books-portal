import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { OrderComponent } from './order/order.component';
import { CartComponent } from './cart/cart.component';
import { OrderDetailComponent } from './order-detail/order-detail.component';
import { LandingPageComponent } from './landing-page/landing-page.component';

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
    path:'order',
    component:OrderComponent
  },
  {
    path: 'order/:id',
    component: OrderDetailComponent
  },
  {
    path:'cart',
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
