import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BookService } from '../books/book.service';
import {  BundleService } from './bundle.service';
import { SweetAlertOptions } from 'sweetalert2';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import Swal from 'sweetalert2';
import { Book, Bundle, BundleBook, Grade, School, Category } from 'src/app/parents/services/modal';

@Component({
  selector: 'app-bundle',
  templateUrl: './bundle.component.html',
  styleUrls: ['./bundle.component.scss'],
})
export class BundleComponent implements OnInit {
  books: Book[] = [];
  bundleForm!: FormGroup;
  currentBundleId: string = '';
  selectedBooks: { id: string; bookName: string; price: number ,quantity:number}[] = [];
  bundles: Bundle[] = [];
  showBooks: Book[] = []
  grades: Grade[] = []
  grade: Grade = { name: '' };
  school: School = { name: '' ,representative:'',phoneNumber:'' };
  types: Category[] = []
  schools: School[] = []
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
      grade: ['', Validators.required],
      school: ['', Validators.required],
      price: [0, Validators.required],
      books: this.fb.array([]),
    });
    this.booksFormArray.valueChanges.subscribe(() => {
      const totalPrice = this.getTotalBundlePrice();
      this.bundleForm.get('price')?.setValue(totalPrice, { emitEvent: false });
    });

  }
  get booksFormArray(): FormArray {
    return this.bundleForm.get('books') as FormArray;
  }
  addBooksToForm() {
    this.booksFormArray.clear();
    this.selectedBooks.forEach((book) => {
      this.booksFormArray.push(
        this.fb.group({
          id: [book.id],
          bookName: [book.bookName],
          price: [book.price],
          quantity:[book.quantity ]
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
      grade: null,
      school: null,
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
    this.bundleForm.get('price')?.setValue(bundle.price, { emitEvent: false });
  }

  loadBooks() {
    this.bookService.getBooks().subscribe((books) => {
      this.books = books;
      this.books = books.map(book => ({
        ...book,
        grade: this.getGrade(book.grade),
        category:this.getType(book.category)
      }));
      this.cdr.detectChanges();
      this.getBundles()
    });
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
      this.types = types;
      this.getSchool()
    })
  }
  getSchool() {
    this.bundleService.getSchool().subscribe((schools) => {
      this.schools = schools;
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
  getSchoolName(id: any): string {
    const type = this.schools.find(g => g.id === id);
    return type ? type.name : 'Unknown Type';
  }
  getBundles() {
    this.bundleService.getBundles().subscribe((bundle) => {
      this.bundles = bundle;
      this.bundles = bundle.map(bundle => ({
        ...bundle,
        grade: this.getGrade(bundle.grade),
        school:this.getSchoolName(bundle.school)
      }));
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
    selectedBooks.forEach((book) => {
      const exists = this.selectedBooks.some((b) => b.id === book.id);
      if (!exists) {
        this.selectedBooks.push({
          id: book.id,
          bookName: book.bookName,
          price: book.price,
          quantity: 1
        });
      }
    });
    this.booksFormArray.clear();
    this.selectedBooks.forEach((book) => {
      this.booksFormArray.push(
        this.fb.group({
          id: [book.id],
          bookName: [book.bookName],
          price: [book.price],
          quantity:[book.quantity]
        })
      );
    });
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
  openGrade(content: any) {
    this.grade = { name: '' }
    this.modalService.open(content, { size: 'md', centered: true });
  }
  submit(modal: any) {
    this.bookService.addGrade(this.grade).subscribe({
      next: (gradeId) => {
        console.log('Grade added with ID:', gradeId);
        this.showAlert(this.successAlert);
        this.bundleForm.patchValue({grade:gradeId});
        modal.close();
        this.getGrades()
      },
      error: (err) => {
        console.error('Error adding grade:', err.message);
        this.errorAlert = {
          icon: 'error',
          title: 'Error!',
          text: err.message,
        };
        this.showAlert(this.errorAlert)
      }
    });
  }
  deleteGrade(id: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this grade?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.bookService.deleteGrade(id).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'The grade has been deleted.', 'success');
            this.getGrades();
          },
          error: (error) => {
            Swal.fire('Error!', 'There was a problem deleting the grade.', 'error');
            console.error(error);
          }
        });
      }
    });
  }

  openSchool(content: any) {
    this.school = { name: '' ,representative:'',phoneNumber:'' }
    this.modalService.open(content, { size: 'md', centered: true });
  }
  submitSchool(modal: any) {
    this.bundleService.addSchool(this.school).subscribe({
      next: (id) => {
        this.showAlert(this.successAlert);
        this.bundleForm.patchValue({school:id});
        modal.close();
        this.getSchool()
      },
      error: (err) => {
        console.error('Error adding School:', err.message);
        this.errorAlert = {
          icon: 'error',
          title: 'Error!',
          text: err.message,
        };
        this.showAlert(this.errorAlert)
      }
    });
  }
  deleteSchool(id: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this school?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.bundleService.deleteSchool(id).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'The school has been deleted.', 'success');
            this.getGrades();
          },
          error: (error) => {
            Swal.fire('Error!', 'There was a problem deleting the school.', 'error');
            console.error(error);
          }
        });
      }
    });
  }
  getTotalBundlePrice(): number {
    return this.booksFormArray.controls.reduce((total, group) => {
      const price = group.get('price')?.value || 0;
      const quantity = group.get('quantity')?.value || 0;
      return total + (price * quantity);
    }, 0);
  }

}
