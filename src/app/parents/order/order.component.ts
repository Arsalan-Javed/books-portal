import { ChangeDetectorRef, Component } from '@angular/core';
import { CartService } from '../services/cart.service';
import { AuthFirebaseService } from 'src/app/modules/auth/services/auth.firebase.service';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import Swal from 'sweetalert2'
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Order } from '../services/modal';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule],
  templateUrl: './order.component.html',
  styleUrl: './order.component.scss'
})
export class OrderComponent {
  isLoading:boolean = false
  orders:Order[]=[]
  userId:string
  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private cartService: CartService,
    private authService: AuthFirebaseService
  ) {
  }
  ngOnInit() {
    this.userId = this.authService.getCurrentUser().uid
    this.getOrders(this.userId)
  }
  getOrders(id:string){
    this.isLoading = true
    this.cartService.getOrders(id).subscribe((orders)=>{
      this.orders = orders.map(order => ({
        ...order,
        createdAt: (order.createdAt as any).toDate()
      }));
      this.isLoading = false
      this.cdr.detectChanges()
    })
  }
  goToOrder(id: any) {
    this.router.navigate(['/order', id]);
  }
}
