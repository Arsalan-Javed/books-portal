import { NgModule } from '@angular/core';
import { KeeniconComponent } from './keenicon/keenicon.component';
import { CommonModule } from "@angular/common";
import { BooksListComponent } from './books-list/books-list.component';

@NgModule({
  declarations: [
    KeeniconComponent,
    BooksListComponent
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    KeeniconComponent,
    BooksListComponent
  ]
})
export class SharedModule {
}
