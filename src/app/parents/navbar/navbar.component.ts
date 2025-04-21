import { AfterViewInit, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { menuReinitialization } from 'src/app/_metronic/kt/kt-helpers';
import { CartService } from '../services/cart.service';
import { AuthFirebaseService } from 'src/app/modules/auth/services/auth.firebase.service';

@Component({
	selector: 'app-parent-navbar',
	templateUrl: './navbar.component.html',
	styleUrls: ['./navbar.component.scss'],
})
export class ParentNavbarComponent implements OnInit, AfterViewInit {
	@Input() appHeaderDefaulMenuDisplay: boolean;
	@Input() isRtl: boolean;
  cart: any[]=[]
	itemClass: string = 'ms-1 ms-lg-3';
	btnClass: string = 'btn btn-icon btn-custom btn-icon-muted btn-active-light btn-active-color-primary w-35px h-35px w-md-40px h-md-40px';
	userAvatarClass: string = 'symbol-35px symbol-md-40px';
	btnIconClass: string = 'fs-2 fs-md-1';

	constructor(
    private cartService:CartService,
    private authService:AuthFirebaseService,
    private cdr: ChangeDetectorRef
  ) { }

	ngAfterViewInit(): void {
		menuReinitialization();
	}

	ngOnInit(): void {
    const userId = this.authService.getCurrentUser().uid
    this.getCart(userId)
    this.cartService.cartChanged$.subscribe(() => {
      this.getCart(userId);
    });
    this.cartService.getCart(userId).subscribe((cart=>{console.log(cart);
    }))
  }
  getCart(userId:any){
    this.cartService.getCartByUser(userId).subscribe((cart:any)=>{
      this.cart = cart
      this.cdr.detectChanges();
      console.log(cart);

    })
  }

}
