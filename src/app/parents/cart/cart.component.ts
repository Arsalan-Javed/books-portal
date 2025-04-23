import { ChangeDetectorRef, Component } from '@angular/core';
import { BookService } from 'src/app/pages/books/book.service';
import { BundleService } from 'src/app/pages/bundle/bundle.service';
import { CartService } from '../services/cart.service';
import { AuthFirebaseService } from 'src/app/modules/auth/services/auth.firebase.service';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { PopulatedCartItem } from '../services/modal';
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
  cart: PopulatedCartItem[] = []
  userId:string
  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private bundleService: BundleService,
    private cartService: CartService,
    private authService: AuthFirebaseService
  ) {
  }
  ngOnInit() {
    this.userId = this.authService.getCurrentUser().uid
    this.getCart(this.userId)
  }
  getCart(userId: any) {
    this.cartService.getCart(userId).subscribe((cart: any) => {
      this.cart = cart
      this.cdr.detectChanges();
    })
  }
  remove(id: any) {
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
        this.cartService.removeCartItem(id).subscribe(() => {
          this.cart = this.cart.filter(item => item.id !== id);
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
    this.cartService.updateCartItem(item.id as string, { quantity: item.quantity }).subscribe(() => { });
  }

  getTotalPrice(): number {
    return this.cart.reduce((total, item) => {
      const price = item.book
        ? item.book.price
        : item.bundle
          ? this.getBundlePrice(item)
          : 0;
      return total + (item.quantity * price);
    }, 0);
  }

  getGrandTotalPrice(): number {
    if (!this.cart || this.cart.length === 0) return 0;

    return this.cart.reduce((total, item) => {
      if (item.book) {
        return total + (item.quantity * item.book.price);
      } else if (item.bundle) {
        return total + (item.quantity * this.getBundlePrice(item));
      }
      return total;
    }, 0);
  }


  checkout() {
    this.cartService.placeOrder(this.userId, this.cart).subscribe({
      next: () => {
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


}
