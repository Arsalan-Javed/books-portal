import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BooksComponent } from './books.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { SharedModule } from "../../_metronic/shared/shared.module";
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';


@NgModule({
  declarations: [BooksComponent],
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
        component: BooksComponent,
      },
    ]),
  ],
  exports:[BooksComponent]
})
export class BooksModule {}
