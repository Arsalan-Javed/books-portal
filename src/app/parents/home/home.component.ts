import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { BookService } from 'src/app/pages/books/book.service';
import { BundleService } from 'src/app/pages/bundle/bundle.service';
import { CartService } from '../services/cart.service';
import Swal from 'sweetalert2'
import { AuthFirebaseService } from 'src/app/modules/auth/services/auth.firebase.service';
import { Book, Bundle, BundleBook, Grade, School, Category } from '../services/modal';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  filters = {
    name:'',
    category: '',
    school: '',
    grade: ''
  };
  filteredItems:any = [];
  allItems:any
  books: Book[] = [];
  allBooks:Book[]=[]
  grades: Grade[] = []
  types: Category[] = []
  bundles: Bundle[] = [];
  showBooks: Book[] = [];
  schools: School[] = [];
  isLoading: boolean = false
  constructor(
    private modalService: NgbModal,
    private bookService: BookService,
    private cdr: ChangeDetectorRef,
    private bundleService: BundleService,
    private cartService: CartService,
    private router: Router,
    private authService: AuthFirebaseService
  ) {
  }
  ngOnInit() {
    this.isLoading = true
    this.getGrades();
    const filters = history.state.filters
    if (filters) {
      this.filters = filters
      this.applyFilters();
    } else {
      this.filters = {
        name: '',
        category: '',
        school: '',
        grade: ''
      };
      this.applyFilters();
    }
  }
  loadBooks() {
    this.bookService.getBooks().subscribe((books) => {
      this.allBooks = books.map(book => ({
        ...book,
        grade: this.getGrade(book.grade),
        category: this.getType(book.category),
        name:book.bookName,
        type: 'book'
      }));
      this.books = books.filter(b => !b.isDeleted)
      .map(book => ({
        ...book,
        grade: this.getGrade(book.grade),
        category: this.getType(book.category),
        name:book.bookName,
        type: 'book'
      }));
      this.getBundles()
    });
  }
  getGrades() {
    this.bookService.getGrades().subscribe((grades) => {
      this.grades = grades;
      this.getTypes()
      this.getSchools()
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
  getSchools() {
    this.bundleService.getSchool().subscribe((schools) => {
      this.schools = schools
    })
  }
  getGrade(id: any): string {
    const grade = this.grades.find(g => g.id === id);
    return grade ? grade.name : 'Unknown Grade';
  }
  getType(id: any): string {
    const type = this.types.find(g => g.id === id);
    return type ? type.name : 'Unknown Type';
  }
  getSchool(id: any): string {
    const school = this.schools.find(g => g.id === id);
    return school ? school.name : 'Unknown School';
  }
  getBundles() {
    this.bundleService.getBundles().subscribe((bundle) => {
      this.bundles = bundle.filter(b => !b.isDeleted)
      .map(bundle => ({
        ...bundle,
        grade: this.getGrade(bundle.grade),
        school: this.getSchool(bundle.school),
        name:bundle.bundleName,
        type: 'bundle'
      }))
      this.isLoading = false
      this.allItems = [...this.books, ...this.bundles];
      this.applyFilters()
      this.cdr.detectChanges();
    });
  }
  getTotalPrice(books: BundleBook[] = []): number {
    return books.reduce((sum, book) => sum + (book.price*book.quantity), 0);
  }
  openShowBook(content: any, books: any) {
    this.showBooks = books
      .map((sb: any) => {
        const matchedBook = this.allBooks.find(book => book.id === sb.id);
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

  addToCart(book: any) {
    const item = {...book, bookId: book.id};
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
        const errorMsg = err.message || 'Failed to add item to cart!';
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMsg,
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  }
  addCart(bundle: any) {
    const item = { ...bundle,bundleId: bundle.id, price: bundle.price};
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
        const errorMsg = err.message || 'Failed to add item to cart!';
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMsg,
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  }
  addBundleBook(book: any, modal: any) {
    const item = {...book, bookId: book.id,quantity:book.quantity , isDiscount:true };
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
          const errorMsg = err.message || 'Failed to add item to cart!';
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errorMsg,
            timer: 2000,
            showConfirmButton: false,
          });
        modal.close()
      }
    });

  }
  applyFilters() {
    const { name, category, school, grade } = this.filters;
    const lowerName = name?.toLowerCase() || '';

    this.filteredItems = this.allItems?.filter((item: any) =>
    (!name || item.name?.toLowerCase().includes(lowerName)) &&
    (!category || item.category === this.getType(category)) &&
    (!school || item.school === this.getSchool(school)) &&
    (!grade || item.grade === this.getGrade(grade))
  );
  }



}
