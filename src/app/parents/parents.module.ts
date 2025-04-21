import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { Routing } from './routing';
import { SharedModule } from '../_metronic/shared/shared.module';
import { ParentLayoutComponent } from './parent-layout.component';
import { DrawersModule, DropdownMenusModule, EngagesModule, ExtrasModule, ModalsModule } from '../_metronic/partials';
import { ParentNavbarComponent } from './navbar/navbar.component';
import { TranslationModule } from '../modules/i18n';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { NgbDropdownModule, NgbProgressbarModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeModeModule } from '../_metronic/partials/layout/theme-mode-switcher/theme-mode.module';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';

const routes: Routes = [
  {
    path: '',
    component: ParentLayoutComponent,
    children:Routing
  },
];

@NgModule({
  declarations: [
    ParentLayoutComponent,
    ParentNavbarComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SweetAlert2Module.forChild(),
    TranslationModule,
    InlineSVGModule,
    NgbDropdownModule,
    NgbProgressbarModule,
    ExtrasModule,
    ModalsModule,
    DrawersModule,
    EngagesModule,
    DropdownMenusModule,
    NgbTooltipModule,
    TranslateModule,
    ThemeModeModule,
    SharedModule
  ]
})
export class ParentsModule { }
