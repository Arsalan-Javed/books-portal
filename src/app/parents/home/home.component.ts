import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { BookService } from 'src/app/pages/books/book.service';
import { BundleService } from 'src/app/pages/bundle/bundle.service';
import { CartService } from '../services/cart.service';
import Swal from 'sweetalert2';
import { AuthFirebaseService } from 'src/app/modules/auth/services/auth.firebase.service';
import {
  Book,
  Bundle,
  BundleBook,
  Grade,
  School,
  Category,
} from '../services/modal';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatGridListModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  @ViewChild('scrollBooksContainer', { static: false })
  scrollBooksContainer!: ElementRef;
  @ViewChild('scrollSuppliesContainer', { static: false })
  scrollSuppliesContainer!: ElementRef;

  filters = {
    name: '',
    category: '',
    school: '',
    grade: '',
    subject: '',
    priceRange: [0, 1000], // Example price range
  };
  filteredItems: any = [];
  allItems: any;
  books: Book[] = [];
  allBooks: Book[] = [];
  grades: Grade[] = [];
  types: Category[] = [];
  bundles: Bundle[] = [];
  showBooks: Book[] = [];
  allSupplies: Book[] = [];
  schools: School[] = [];
  isLoading: boolean = false;

  subjects = [
    { name: 'Spanish', icon: 'assets/icons/spanish.svg' },
    { name: 'English', icon: 'assets/icons/english.svg' },
    { name: 'Math', icon: 'assets/icons/math.svg' },
    { name: 'Science', icon: 'assets/icons/science.svg' },
    { name: 'History', icon: 'assets/icons/history.svg' },
    { name: 'Art', icon: 'assets/icons/art.svg' },
    { name: 'Music', icon: 'assets/icons/music.svg' },
    { name: 'Programming', icon: 'assets/icons/programming.svg' },
  ];

  constructor(
    private modalService: NgbModal,
    private bookService: BookService,
    private cdr: ChangeDetectorRef,
    private bundleService: BundleService,
    private cartService: CartService,
    private router: Router,
    private authService: AuthFirebaseService
  ) {}
  ngOnInit() {
    this.isLoading = true;
    this.getGrades();
    const filters = history.state.filters;
    if (filters) {
      this.filters = filters;
      this.applyFilters();
    } else {
      this.filters = {
        name: '',
        category: '',
        school: '',
        grade: '',
        subject: '',
        priceRange: [0, 1000], // Example price range
      };
      this.applyFilters();
    }
  }
  loadBooks() {
    this.bookService.getBooks().subscribe((books) => {
      this.allBooks = books.map((book) => ({
        ...book,
        grade: this.getGrade(book.grade),
        category: this.getType(book.category),
        name: book.bookName,
        type: 'book',
      }));
      this.books = this.allBooks
        .filter((b) => !b.isDeleted && b.category.toLowerCase() !== 'supplies')
        .map((book) => ({
          ...book,
          grade: this.getGrade(book.grade),
          category: this.getType(book.category),
          name: book.bookName,
          type: 'book',
        }));
      this.allSupplies = this.allBooks.filter(
        (b) => !b.isDeleted && b.category.toLowerCase().includes('supplies')
      );

      console.log('All Books:', this.allBooks);
      console.log('Filtered Books:', this.books);
      console.log('All Supplies:', this.allSupplies);
      this.getBundles();
    });
  }
  getGrades() {
    this.bookService.getGrades().subscribe(
      (grades) => {
        this.grades = grades.filter((b) => !b.isDeleted);
        this.getTypes();
        this.getSchools();
        this.loadBooks();
      },
      () => {
        this.loadBooks();
      }
    );
  }
  getTypes() {
    this.bookService.getCategories().subscribe((types) => {
      this.types = types.filter((b) => !b.isDeleted);
    });
  }
  getSchools() {
    this.bundleService.getSchool().subscribe((schools) => {
      this.schools = schools.filter((b) => !b.isDeleted);
    });
  }
  getGrade(id: any): string {
    const grade = this.grades.find((g) => g.id === id);
    return grade ? grade.name : 'Unknown Grade';
  }
  getType(id: any): string {
    const type = this.types.find((g) => g.id === id);
    return type ? type.name : 'Unknown Type';
  }
  getSchool(id: any): School {
    const school = this.schools.find((g) => g.id === id);
    return school
      ? school
      : {
          id: '',
          name: 'Unknown School',
          image: '',
          isDeleted: false,
          address: '',
          representative: '',
          phoneNumber: '',
        };
  }
  getBundles() {
    this.bundleService.getBundles().subscribe((bundle) => {
      this.bundles = bundle
        .filter((b) => !b.isDeleted)
        .map((bundle) => ({
          ...bundle,
          grade: this.getGrade(bundle.grade),
          school: this.getSchool(bundle.school).name,
          name: bundle.bundleName,
          type: 'bundle',
          image:
            this.getSchool(bundle.school).image ||
            'assets/images/bundle-default.png',
        }));
      this.isLoading = false;
      // this.allItems = [...this.books, ...this.bundles];
      this.allItems = [...this.bundles]; // sort by name to display all books and bundles
      this.allItems = this.allItems.sort((a: any, b: any) =>
        a.name.localeCompare(b.name)
      );
      this.applyFilters();
      this.cdr.detectChanges();
    });
  }
  getTotalPrice(books: BundleBook[] = []): number {
    return books.reduce((sum, book) => sum + book.price * book.quantity, 0);
  }
  openShowBook(content: any, books: any) {
    this.showBooks = books
      .map((sb: any) => {
        const matchedBook = this.allBooks.find((book) => book.id === sb.id);
        if (matchedBook) {
          return {
            ...matchedBook,
            price: sb.price,
            quantity: sb.quantity,
          };
        }
        return null;
      })
      .filter((book: any) => !!book);

    this.modalService.open(content, { size: 'xl', centered: true });
  }

  addToCart(book: any) {
    const item = { ...book, bookId: book.id };
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
      },
    });
  }
  addCart(bundle: any) {
    const item = { ...bundle, bundleId: bundle.id, price: bundle.price };
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
      },
    });
  }
  addBundleBook(book: any, modal: any) {
    const item = {
      ...book,
      bookId: book.id,
      quantity: book.quantity,
      isDiscount: true,
    };
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
        modal.close();
      },
    });
  }
  applyFilters() {
    const { name, category, school, grade } = this.filters;
    const lowerName = name?.toLowerCase() || '';

    this.filteredItems = this.allItems?.filter(
      (item: any) =>
        (!name || item.name?.toLowerCase().includes(lowerName)) &&
        (!category || item.category === this.getType(category)) &&
        (!school || item.school === this.getSchool(school).name) &&
        (!grade || item.grade === this.getGrade(grade))
    );
    console.log('Filtered Items:', this.filteredItems);
    console.log('Filter:', this.filters);
    this.cdr.detectChanges();
  }

  // scrolling

  scrollLeft(container: string) {
    if (container === 'books') {
      this.scrollBooksContainer.nativeElement.scrollBy({
        left: -300,
        behavior: 'smooth',
      });
    } else {
      this.scrollSuppliesContainer.nativeElement.scrollBy({
        left: -300,
        behavior: 'smooth',
      });
    }
    // this.scrollContainer.nativeElement.scrollBy({
    //   left: -300,
    //   behavior: 'smooth',
    // });
  }

  scrollRight(container: string) {
    if (container === 'books') {
      this.scrollBooksContainer.nativeElement.scrollBy({
        left: 300,
        behavior: 'smooth',
      });
    } else {
      this.scrollSuppliesContainer.nativeElement.scrollBy({
        left: 300,
        behavior: 'smooth',
      });
    }
  }

  navFilter(item: any) {
    this.filters = {
      name: item?.name || '',
      category: item?.category || '',
      school: item.school || '',
      grade: item?.grade || '',
      subject: item?.subject || '',
      priceRange: [0, 1000], // Example price range
    };
    this.applyFilters();
    this.router.navigate(['/parents/browse'], {
      state: { filters: this.filters },
    });
  }
}
