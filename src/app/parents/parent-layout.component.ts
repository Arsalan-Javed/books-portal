import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthFirebaseService } from '../modules/auth/services/auth.firebase.service';

@Component({
  selector: 'app-parent-layout',
  templateUrl: './parent-layout.component.html',
  styleUrl: './parent-layout.component.scss'
})
export class ParentLayoutComponent {
  user:any
  constructor(
    private authService: AuthFirebaseService
  ) {
  }
  ngOnInit() {
    this.user = this.authService.getCurrentUser()
  }
}
