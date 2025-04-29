import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthFirebaseService } from 'src/app/modules/auth/services/auth.firebase.service';
import { CartService } from 'src/app/parents/services/cart.service';
import { Order } from 'src/app/parents/services/modal';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class OrdersComponent {
  orders:any
  isLoading:boolean = false
  users:any
  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private cartService: CartService,
    private authService: AuthFirebaseService
  ) {
  }
  async ngOnInit() {
    this.isLoading = true
    await this.getUsers();
    this.getOrders();
  }

  async getUsers() {
    this.users = await this.authService.getAllUsers();
  }

  getOrders() {
    this.cartService.getAllOrders().subscribe((orders) => {
      this.orders = orders.map(order => ({
        ...order,
        user: this.getUser(order.userId),
        createdAt: (order.createdAt as any).toDate()
      }));
      this.isLoading = false
      this.cdr.detectChanges();
    });
  }

  getUser(id: string): any {
    return this.users.find((user: any) => user.uid === id);
  }
  goToOrder(id: any) {
    this.router.navigate(['orders/order', id]);
  }
}
