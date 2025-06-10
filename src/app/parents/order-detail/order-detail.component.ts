import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from '../services/cart.service';
import { Book, Category, Grade, Order } from '../services/modal';
import { CommonModule } from '@angular/common';
import { Timestamp } from 'firebase/firestore';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BookService } from 'src/app/pages/books/book.service';
import { AuthFirebaseService } from 'src/app/modules/auth/services/auth.firebase.service';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { BundleService } from 'src/app/pages/bundle/bundle.service';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.scss'
})
export class OrderDetailComponent {
  books: Book[] = [];
  grades: Grade[] = []
  types: Category[] = []
  orderId: string | null = null;
  order: any
  showBooks: any
  shipmentCost: number = 0;
  user: any
  selectedSchool: any
  fromPage: string = 'orders';
  constructor(private route: ActivatedRoute,
    private router: Router,
    private cartService: CartService,
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal,
    private bookService: BookService,
    private bundleService: BundleService,
    private authService: AuthFirebaseService
  ) { }
  ngOnInit() {
    if (history.state && history.state.from) {
      this.fromPage = history.state.from;
    }
    this.user = this.authService.getCurrentUser()
    this.orderId = this.route.snapshot.paramMap.get('id');
    if (this.orderId) {
      this.getOrder(this.orderId)
      this.getGrades()

    }
  }
  getOrder(id: any) {
    this.cartService.getOrderById(id).subscribe(async order => {
      if (order) {
        const user = await this.authService.getUserById(order.userId);

        this.order = {
          ...order,
          user: user || null,
          createdAt: (order.createdAt as any).toDate()
        };
        if (order.school) {
          this.getSchoolNameById(order.school);
        }
        this.cdr.detectChanges();
      }
    });
  }

  openShowBook(content: any, showbooks: any) {
    this.showBooks = showbooks
      .map((sb: any) => {
        const matchedBook = this.books.find(book => book.id === sb.id);
        if (matchedBook) {
          return {
            ...matchedBook,
            price: sb.price,
            quantity: sb.quantity
          };
        }
        return null;
      })
      .filter((book: any) => !!book);

    this.modalService.open(content, { size: 'xl', centered: true });
  }
  loadBooks() {
    this.bookService.getBooks().subscribe((books) => {
      this.books = books.map(book => ({
        ...book,
        grade: this.getGrade(book.grade),
        category: this.getType(book.category),
      }));
    });
  }
  getGrade(id: any): string {
    const grade = this.grades.find(g => g.id === id);
    return grade ? grade.name : 'Unknown Grade';
  }
  getType(id: any): string {
    const type = this.types.find(g => g.id === id);
    return type ? type.name : 'Unknown Type';
  }
  getGrades() {
    this.bookService.getGrades().subscribe((grades) => {
      this.grades = grades;
      this.getTypes()
      this.loadBooks();
    }, () => {
      this.loadBooks();
    })
  }
  getTypes() {
    this.bookService.getCategories().subscribe((types) => {
      this.types = types
    })
  }
  calculateSubTotal(): number {
    let subTotal = 0;
    for (let item of this.order.items) {
      if (item.book) {
        subTotal += item.quantity * item.book.price;
      } else if (item.bundle) {
        subTotal += item.quantity * item.bundle.price;
      }
    }
    return subTotal;
  }

  calculateGrandTotal(): number {
    return this.calculateSubTotal() + this.shipmentCost;
  }

  onStatusChange(order: any) {
    if (!order?.id) return;

    const { status, paymentStatus } = order;

    this.cartService.updateOrder(order.id, { status, paymentStatus })
      .then(async () => {
        Swal.fire({
          icon: 'success',
          title: 'Updated Successfully',
          showConfirmButton: false,
          timer: 2000
        });

        if (status === 'cancel') {
          const bookQuantityMap: Record<string, number> = {};

          for (const item of order.items) {
            if (item.type === 'book') {
              bookQuantityMap[item.id] = (bookQuantityMap[item.id] || 0) + item.quantity;
            } else if (item.type === 'bundle' && Array.isArray(item.books)) {
              const bundleQty = item.quantity || 1;
              for (const book of item.books) {
                if (book?.id && typeof book.quantity === 'number') {
                  const totalQty = book.quantity * bundleQty;
                  bookQuantityMap[book.id] = (bookQuantityMap[book.id] || 0) + totalQty;
                }
              }
            }
          }

          const updatePromises = Object.entries(bookQuantityMap).map(([bookId, qty]) =>
            this.bookService.increaseBookQuantity(bookId, qty)
          );

          await Promise.all(updatePromises);
        }
      })
      .catch(() => {
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          showConfirmButton: false,
          timer: 2000
        });
      });
  }


  backOrder() {
    this.router.navigate([this.fromPage === 'dashboard' ? '/' : '/orders']);
  }

  getSchoolNameById(id: string): void {
    this.bundleService.getSchoolById(id).subscribe({
      next: (school: any) => {
        this.selectedSchool = school;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching school:', err);
        this.selectedSchool = 'Unknown';
      }
    });
  }



}
