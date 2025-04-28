import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { OrderComponent } from './order/order.component';
import { CartComponent } from './cart/cart.component';
import { OrderDetailComponent } from './order-detail/order-detail.component';

const Routing: Routes = [

  {
    path:'parent',
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
    redirectTo: '/parent',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'error/404',
  },
];

export { Routing };
