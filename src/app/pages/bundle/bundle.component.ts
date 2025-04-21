import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BookService, Grade } from '../books/book.service';
import { Bundle, BundleBook, BundleService } from './bundle.service';
import { Book } from '../books/book.service';
import { SweetAlertOptions } from 'sweetalert2';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-bundle',
  templateUrl: './bundle.component.html',
  styleUrls: ['./bundle.component.scss'],
})
export class BundleComponent implements OnInit {
  books: Book[] = [];
  bundleForm!: FormGroup;
  currentBundleId: string = '';
  selectedBooks: { id: string; bookName: string; price: number }[] = [];
  bundles: Bundle[] = [];
  showBooks: Book[] = []
  grades: Grade[] = []
  dummyImg: string = './assets/images/books.jpg'
  constructor(
    private modalService: NgbModal,
    private bookService: BookService,
    private bundleService: BundleService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.getGrades();
    this.initForm();
  }
  swalOptions: SweetAlertOptions = {};
  @ViewChild('noticeSwal')
  noticeSwal!: SwalComponent;
  successAlert: SweetAlertOptions = {
    icon: 'success',
    title: 'Success!',
    text: '',
  };
  errorAlert: SweetAlertOptions = {
    icon: 'error',
    title: 'Error!',
    text: '',
  };

  initForm() {
    this.bundleForm = this.fb.group({
      bundleName: ['', Validators.required],
      image: ['', Validators.required],
      books: this.fb.array([]),
    });
    this.addBooksToForm();
  }
  get booksFormArray(): FormArray {
    return this.bundleForm.get('books') as FormArray;
  }
  addBooksToForm() {
    this.booksFormArray.clear();
    const booksFormArray = this.bundleForm.get('books') as FormArray;
    this.selectedBooks.forEach((book) => {
      booksFormArray.push(
        this.fb.group({
          id: [book.id],
          bookName: [book.bookName],
          price: [book.price],
        })
      );
    });
  }

  getBookControl(index: number, controlName: string): FormControl {
    return this.booksFormArray.at(index).get(controlName) as FormControl;
  }


  open(content: any) {
    this.bundleForm.reset({
      bundleName: '',
      image: '',
      books: [],
    });
    this.selectedBooks = [];
    this.currentBundleId = ''
    this.booksFormArray.clear();
    this.dummyImg = './assets/images/books.jpg'
    this.modalService.open(content, { size: 'lg', centered: true });
  }


  submitBundle(modal: any) {
    if (this.bundleForm.invalid || this.selectedBooks.length === 0) return;
    const bundleData: Bundle = this.bundleForm.getRawValue()

    if (this.currentBundleId && this.currentBundleId !== '') {
      this.bundleService.updateBundle(this.currentBundleId, bundleData).subscribe({
        next: () => {
          this.successAlert = {
            icon: 'success',
            title: 'Success!',
            text: 'Bundle Successfully Updated',
          };
          this.showAlert(this.successAlert);
        },
        error: (err) => {
          this.errorAlert = {
            icon: 'error',
            title: 'Error!',
            text: err.message,
          };
          this.showAlert(this.errorAlert)
        }
      });
    } else {
      this.bundleService.addBundle(bundleData).subscribe({
        next: () => {
          this.successAlert = {
            icon: 'success',
            title: 'Success!',
            text: 'Bundle Successfully Added',
          };
          this.showAlert(this.successAlert);
        },
        error: (err) => {
          this.errorAlert = {
            icon: 'error',
            title: 'Error!',
            text: err.message,
          };
          this.showAlert(this.errorAlert)
        }
      });
    }

    modal.close();
    this.loadBooks();
  }

  editBundle(modal: any, bundle: Bundle) {
    this.currentBundleId = bundle?.id || '';
    this.bundleForm.patchValue(bundle);
    this.selectedBooks = bundle.books;
    this.addBooksToForm()
    this.modalService.open(modal, { size: 'lg', centered: true });
  }

  loadBooks() {
    this.bookService.getBooks().subscribe((books) => {
      this.books = books;
      this.books = books.map(book => ({
        ...book,
        grade: this.getGrade(book.grade)
      }));
      this.cdr.detectChanges();
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

  deleteBundle(id: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this Bundle?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.bundleService.deleteBundle(id).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'The Bundle has been deleted.', 'success');
            this.loadBooks();
          },
          error: (error) => {
            Swal.fire('Error!', 'There was a problem deleting the Bundle.', 'error');
            console.error(error);
          }
        });
      }
    });
  }



  onRemoveBook(bookId: number) {
    this.booksFormArray.removeAt(bookId);
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


  openSelectBooks(content: any) {
    this.modalService.open(content, { size: 'xl', centered: true });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        this.dummyImg = base64String
        const strippedBase64 = base64String.replace(/^data:image\/[a-z]+;base64,/, '');
        this.bundleForm.patchValue({ image: strippedBase64 })
      };
      reader.readAsDataURL(file);
    }
  }
  handleSelectedBooks(selectedBooks: any[], modalRef: any) {
    this.selectedBooks = selectedBooks
    this.addBooksToForm();
    modalRef.close();
  }
  showAlert(swalOptions: SweetAlertOptions) {
    let style = swalOptions.icon?.toString() || 'success';
    if (swalOptions.icon === 'error') {
      style = 'danger';
    }
    this.swalOptions = Object.assign({
      buttonsStyling: false,
      confirmButtonText: "Ok, got it!",
      customClass: {
        confirmButton: "btn btn-" + style
      }
    }, swalOptions);
    this.cdr.detectChanges();
    this.noticeSwal.fire();
  }


}
