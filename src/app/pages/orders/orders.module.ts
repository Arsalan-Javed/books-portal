import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { SharedModule } from "../../_metronic/shared/shared.module";
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { OrdersComponent } from './orders.component';
import { OrderDetailComponent } from 'src/app/parents/order-detail/order-detail.component';



@NgModule({
  declarations: [OrdersComponent],
  imports: [
    CommonModule,
    FormsModule,
    InlineSVGModule,
    NgbTooltipModule,
    SharedModule,
    ReactiveFormsModule,
    SweetAlert2Module.forChild(),
    RouterModule.forChild([
      {
        path: '',
        component: OrdersComponent,
      },
      {
        path: 'order/:id',
        component: OrderDetailComponent
      },
    ]),
  ]
})
export class OrderModule { }
