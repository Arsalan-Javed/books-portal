import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { Book, BookService, Grade } from 'src/app/pages/books/book.service';
import { Bundle, BundleBook, BundleService } from 'src/app/pages/bundle/bundle.service';
import { CartService } from '../services/cart.service';
import Swal from 'sweetalert2'
import { AuthFirebaseService } from 'src/app/modules/auth/services/auth.firebase.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule,SharedModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  books: Book[] = [];
  grades: Grade[] = []
  bundles: Bundle[] = [];
  showBooks: Book[] = []

  constructor(
    private modalService: NgbModal,
    private bookService: BookService,
    private cdr: ChangeDetectorRef,
    private bundleService: BundleService,
    private cartService:CartService,
    private authService: AuthFirebaseService
  ) {
  }
  ngOnInit() {
    this.getGrades();
  }
  loadBooks() {
    this.bookService.getBooks().subscribe((books) => {
      this.books = books;
      this.books = books.map(book => ({
        ...book,
        grade: this.getGrade(book.grade)
      }));
      this.getBundles()
    });
  }
  getGrades() {
    this.bookService.getGrades().subscribe((grades) => {
      this.grades = grades;
      this.loadBooks();
    }, () => {
      this.loadBooks();
    })
  }
  getGrade(id: any): string {
    const grade = this.grades.find(g => g.id === id);
    return grade ? grade.name : 'Unknown Grade';
  }
  getBundles() {
    this.bundleService.getBundles().subscribe((bundle) => {
      this.bundles = bundle;
      this.cdr.detectChanges();
    });
  }
  getTotalPrice(books: BundleBook[] = []): number {
    return books.reduce((sum, book) => sum + book.price, 0);
  }
  openShowBook(content: any, showbooks: any) {
    this.showBooks = showbooks
      .map((sb: any) => {
        const matchedBook = this.books.find(book => book.id === sb.id);
        if (matchedBook) {
          return {
            ...matchedBook,
            price: sb.price
          };
        }
        return null;
      })
      .filter((book: any) => !!book);

    this.modalService.open(content, { size: 'xl', centered: true });
  }

  addToCart(book: any) {
    const item = { bookId: book.id };
    this.cartService.addToCart(item).subscribe({
      next: (cartId) => {
        Swal.fire({
          icon: 'success',
          title: 'Added to Cart',
          text: 'Book has been successfully added!',
          timer: 2000,
          showConfirmButton: false,
        });
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to Book item to cart!',
        });
      }
    });
  }
  addCart(bundle: any) {
    const item = { bundleId: bundle.id };
    this.cartService.addToCart(item).subscribe({
      next: (cartId) => {
        Swal.fire({
          icon: 'success',
          title: 'Added to Cart',
          text: 'Bundle has been successfully added!',
          timer: 2000,
          showConfirmButton: false,
        });
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to Bundle item to cart!',
        });
      }
    });
  }
}
