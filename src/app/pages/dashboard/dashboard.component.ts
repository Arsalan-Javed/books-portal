import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { Book, Bundle, Order } from 'src/app/parents/services/modal';
import { BookService } from '../books/book.service';
import { BundleService } from '../bundle/bundle.service';
import { CartService } from 'src/app/parents/services/cart.service';
import { Router } from '@angular/router';
import { AuthFirebaseService } from 'src/app/modules/auth/services/auth.firebase.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  isLoading: boolean = false
  books: Book[] = [];
  bundles: Bundle[] = [];
  orders: Order[] = [];
  dashboardStats: any = [];
  topRecentOrders: any[] = [];
  users: any
  constructor(
    private router: Router,
    private bookService: BookService,
    private bundleService: BundleService,
    private cdr: ChangeDetectorRef,
    private cartService: CartService,
    private authService: AuthFirebaseService
  ) { }
  async ngOnInit() {
    this.isLoading = true
    await this.getUsers();
    this.getBundles();
  }

  async getUsers() {
    this.users = await this.authService.getAllUsers();
  }

  getBundles() {
    this.bundleService.getBundles().subscribe((bundle) => {
      this.bundles = bundle.filter(b => !b.isDeleted);
      this.loadBooks()
    });
  }

  loadBooks() {
    this.bookService.getBooks().subscribe((books) => {
      this.books = books.filter(b => !b.isDeleted)
      this.getOrders()
    });
  }
  getOrders() {
    this.cartService.getAllOrders().subscribe((orders) => {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const sortedOrders = orders.map(order => ({
        ...order,
        user: this.getUser(order.userId),
        createdAt: (order.createdAt as any).toDate()
      }))


      this.orders = sortedOrders;
      this.topRecentOrders = sortedOrders.filter(order =>
        order.createdAt >= startOfToday && order.createdAt < endOfToday
      );

      this.prepareStats();
      this.isLoading = false;
      this.cdr.detectChanges();
    });
  }
  getUser(id: string): any {
    return this.users.find((user: any) => user.uid === id);
  }



  prepareStats() {
    const totalBooks = this.books.filter(book => !book.isDeleted).length;
    const totalBundles = this.bundles.length;
    const totalOrders = this.orders.length;

    const placedOrders = this.orders.filter(o => o.status === 'placed').length;
    const confirmedOrders = this.orders.filter(o => o.status === 'confirmed').length;
    const dispatchedOrders = this.orders.filter(o => o.status === 'dispatched').length;
    const deliveredOrders = this.orders.filter(o => o.status === 'delivered').length;
    const cancelledOrders = this.orders.filter(o => o.status === 'cancel').length;

    this.dashboardStats = [
      { title: 'Books', count: totalBooks },
      { title: 'Bundles', count: totalBundles },
      { title: 'Total Orders', count: totalOrders },
      { title: 'Placed Orders', count: placedOrders },
      { title: 'Confirmed Orders', count: confirmedOrders },
      { title: 'Dispatched Orders', count: dispatchedOrders },
      { title: 'Delivered Orders', count: deliveredOrders },
      { title: 'Cancelled Orders', count: cancelledOrders },
    ];

  }

  goToOrder(id: any) {
    const from = this.router.url.includes('dashboard') ? 'dashboard' : 'orders';
    this.router.navigate(['orders/order', id], {
      state: { from },
    });
  }


}
