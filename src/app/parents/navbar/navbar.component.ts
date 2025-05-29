import { AfterViewInit, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { CartService } from '../services/cart.service';
import { AuthFirebaseService } from 'src/app/modules/auth/services/auth.firebase.service';

@Component({
	selector: 'app-parent-navbar',
	templateUrl: './navbar.component.html',
	styleUrls: ['./navbar.component.scss'],
})
export class ParentNavbarComponent implements OnInit {
	@Input() isRtl: boolean;
  cart: any[]=[]
	itemClass: string = 'ms-1 ms-lg-3';
	btnClass: string = 'btn btn-icon btn-custom btn-icon-muted btn-active-light btn-active-color-primary w-35px h-35px w-md-40px h-md-40px';
	userAvatarClass: string = 'symbol-35px symbol-md-40px';
	btnIconClass: string = 'fs-2 fs-md-1';
  userId:any
	constructor(
    private cartService:CartService,
    private authService:AuthFirebaseService,
    private cdr: ChangeDetectorRef
  ) { }



	ngOnInit(): void {
    const userId = this.authService.getCurrentUser()?.uid
    this.userId = userId
    this.getCart(userId)
    this.cartService.cartChanged$.subscribe(() => {
      this.getCart(userId);
    });
    this.cartService.getCart(userId).subscribe()
  }
  getCart(userId:any){
    this.cartService.getCartByUser(userId).subscribe((cart:any)=>{
      this.cart = cart
      this.cdr.detectChanges();
    })
  }
  logOut(){
    window.location.reload();
    this.authService.logout()
  }

}
