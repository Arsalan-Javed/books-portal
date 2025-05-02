import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { BookService } from 'src/app/pages/books/book.service';
import { BundleService } from 'src/app/pages/bundle/bundle.service';
import { CartService } from '../services/cart.service';
import Swal from 'sweetalert2'
import { AuthFirebaseService } from 'src/app/modules/auth/services/auth.firebase.service';
import { Book, Bundle, BundleBook, Grade, School, Category } from '../services/modal';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  filters = {
    name:'',
    category: '',
    school: '',
    grade: ''
  };
  filteredBooks:any = [];
  filteredBundles:any = [];

  books: Book[] = [];
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
    private authService: AuthFirebaseService
  ) {
  }
  ngOnInit() {
    this.isLoading = true
    this.getGrades();
  }
  loadBooks() {
    this.bookService.getBooks().subscribe((books) => {
      this.books = books.map(book => ({
        ...book,
        grade: this.getGrade(book.grade),
        category: this.getType(book.category),
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
      this.bundles = bundle.map(bundle => ({
        ...bundle,
        grade: this.getGrade(bundle.grade),
        school: this.getSchool(bundle.school),
      }));
      this.isLoading = false
      this.applyFilters()
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
  addBundleBook(book: any, modal: any) {
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
        modal.close()
      }
    });

  }
  applyFilters() {
    const { name, category, school, grade } = this.filters;
    const lowerName = name?.toLowerCase() || '';

    this.filteredBooks = this.books.filter(book =>
      (!name || book.bookName.toLowerCase().includes(lowerName)) &&
      (!category || book.category === this.getType(category)) &&
      (!grade || book.grade === this.getGrade(grade))
    );

    this.filteredBundles = this.bundles.filter(bundle =>
      (!name || bundle.bundleName.toLowerCase().includes(lowerName)) &&
      (!school || bundle.school === this.getSchool(school)) &&
      (!grade || bundle.grade === this.getGrade(grade))
    );
  }


}
