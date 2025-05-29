import { ChangeDetectorRef, Component } from '@angular/core';
import { BookService } from 'src/app/pages/books/book.service';
import { BundleService } from 'src/app/pages/bundle/bundle.service';
import { CartService } from '../services/cart.service';
import { AuthFirebaseService } from 'src/app/modules/auth/services/auth.firebase.service';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { PopulatedCartItem, School } from '../services/modal';
import Swal from 'sweetalert2'
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';


@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent {
  method: any
  cart: any[] = []
  schools: School[] = []
  userId: string
  isLoading: boolean = false
  delivered: string = ''
  address:any;
  school: string = ''
  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private bundleService: BundleService,
    private cartService: CartService,
    private authService: AuthFirebaseService
  ) {
  }
  ngOnInit() {
    this.isLoading = true
    const user = this.authService.getCurrentUser()
    this.userId = user.uid
    this.address = user.address
    this.getCart(this.userId)
    this.getSchool()
    this.address = { street: '', city: '' }
  }
  getCart(userId: any) {
    this.cartService.getCart(userId).subscribe((cart: any) => {
      this.cart = cart
      this.isLoading = false
      this.cdr.detectChanges();
    })
  }
  remove(docId: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to remove this item from your cart?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, remove it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.cartService.removeCartItem(docId).subscribe(() => {
          this.cart = this.cart.filter(item => item.docId !== docId);
          this.cdr.detectChanges();
          Swal.fire({
            title: 'Removed!',
            text: 'The item has been removed.',
            icon: 'success',
            showConfirmButton: false,
            timer: 1500
          });

        });
      }
    });
  }
  getBundlePrice(item: PopulatedCartItem): number {
    if (item.bundle && item.bundle.books) {
      return item.bundle.books.reduce((sum, book) => sum + book.price, 0);
    }
    return 0;
  }
  increaseQuantity(item: PopulatedCartItem) {
    item.quantity += 1;
    this.updateCartItem(item);
  }

  decreaseQuantity(item: PopulatedCartItem) {
    if (item.quantity > 1) {
      item.quantity -= 1;
      this.updateCartItem(item);
    }
  }

  updateCartItem(item: PopulatedCartItem) {
    this.cartService.updateCartItem(item.docId as string, { quantity: item.quantity }).subscribe(() => { });
  }



  getGrandTotalPrice(): number {
    if (!this.cart || this.cart.length === 0) return 0;

    return this.cart.reduce((total, item) => {
      if (item.book) {
        return total + (item.quantity * item.book.price);
      } else if (item.bundle) {
        return total + (item.quantity * item.bundle.price);
      }
      return total;
    }, 0);
  }


  checkout() {
    if (this.school) { this.address = { street: '', city: '' } }
    Swal.fire({
      title: 'Placing your order...',
      html: 'Please wait while we process your order.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.cartService.placeOrder(this.userId, this.cart, this.school, this.address).subscribe({
      next: () => {
        Swal.close();
        Swal.fire({
          title: 'Order Placed!',
          text: 'Your order has been placed successfully.',
          icon: 'success',
          showConfirmButton: false,
          timer: 1500
        }).then(() => {
          this.cartService.clearCart(this.userId)
          this.router.navigate(['/order']);
        });
      },
      error: (err) => {
        Swal.close();
        Swal.fire({
          title: 'Error!',
          text: 'Something went wrong while placing your order.',
          icon: 'error',
          showConfirmButton: false,
          timer: 1500
        });
        console.error('Order placement failed:', err);
      }
    });
  }
  onStatusChange() {
    this.school = ''
  }
  getSchool() {
    this.bundleService.getSchool().subscribe((schools) => {
      this.schools = schools;
      this.isLoading = false
    })
  }

}
