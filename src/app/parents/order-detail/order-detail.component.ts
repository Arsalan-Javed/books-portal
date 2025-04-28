import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CartService } from '../services/cart.service';
import { Book, Category, Grade, Order } from '../services/modal';
import { CommonModule } from '@angular/common';
import { Timestamp } from 'firebase/firestore';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BookService } from 'src/app/pages/books/book.service';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule,SharedModule],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.scss'
})
export class OrderDetailComponent {
  books: Book[] = [];
  grades: Grade[] = []
  types: Category[] = []
  orderId: string | null = null;
  order:any
  showBooks:any
  shipmentCost: number = 0;
  constructor(private route: ActivatedRoute,
    private cartService: CartService,
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal,
    private bookService: BookService,
    ) {  }
  ngOnInit() {
    this.orderId = this.route.snapshot.paramMap.get('id');
    if (this.orderId) {
      this.getOrder(this.orderId)
      this.getGrades()
    }
  }
  getOrder(id: any) {
    this.cartService.getOrderById(id).subscribe(order => {
      if (order) {
        this.order = {
          ...order,
          createdAt: (order.createdAt as any).toDate()
        };
      }
      this.cdr.detectChanges()
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
            quantity:sb.quantity
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
  getTypes(){
    this.bookService.getCategories().subscribe((types)=>{
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

  // Calculate Grand Total
  calculateGrandTotal(): number {
    return this.calculateSubTotal() + this.shipmentCost;
  }

}
