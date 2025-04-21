import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Book, BookService, Grade } from './book.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SweetAlertOptions } from 'sweetalert2';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-books',
  templateUrl: './books.component.html',
  styleUrls: ['./books.component.scss'],
})
export class BooksComponent implements OnInit {
  books: Book[] = [];
  bookForm: FormGroup;
  currentBookId!: any;
  grade: Grade = { name: '' };
  grades: Grade[] = []
  dummyImg: string = './assets/images/book.jpg'
  constructor(
    private modalService: NgbModal,
    private bookService: BookService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.initForm();
  }
  swalOptions: SweetAlertOptions = {};
  @ViewChild('noticeSwal')
  noticeSwal!: SwalComponent;
  ngOnInit() {
    this.getGrades();
  }


  initForm() {
    this.bookForm = this.fb.group({
      bookName: ['', Validators.required],
      image: ['', Validators.required],
      grade: [null, Validators.required],
      academicYear: ['', Validators.required],
      description: ['', Validators.required],
      quantity: [0, [Validators.required, Validators.min(1)]],
      price: [0, [Validators.required, Validators.min(0)]]
    });
  }

  open(content: any) {
    this.currentBookId = ''
    this.dummyImg = './assets/images/book.jpg'
    this.bookForm.reset({
      bookName: '',
      image: '',
      grade:null,
      description: '',
      quantity: 0,
      price: 0
    });
    this.modalService.open(content, { size: 'lg', centered: true });
  }
  successAlert: SweetAlertOptions = {
    icon: 'success',
    title: 'Success!',
    text: 'Grade Created successfully',
  };
  errorAlert: SweetAlertOptions = {
    icon: 'error',
    title: 'Error!',
    text: '',
  };

  submitBook(modal: any) {
    if (this.bookForm.invalid) return;
    if (this.currentBookId) {
      this.bookService.updateBook(this.currentBookId, this.bookForm.value).subscribe({
        next: () => {
          this.successAlert = {
            icon: 'success',
            title: 'Success!',
            text: 'Book Successfully Updated',
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
      this.bookService.addBook(this.bookForm.value).subscribe({
        next: () => {
          this.successAlert = {
            icon: 'success',
            title: 'Success!',
            text: 'Book Successfully Added',
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

  editBook(modal: any, book: Book) {
    this.currentBookId = book?.id
    this.bookForm.patchValue(book);
    this.modalService.open(modal, { size: 'lg', centered: true });
  }

  loadBooks() {
    this.bookService.getBooks().subscribe((books) => {
      this.books = books;
      this.cdr.detectChanges();
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
  deleteBook(id: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this Book?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.bookService.deleteBook(id).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'The Book has been deleted.', 'success');
            this.loadBooks();
          },
          error: (error) => {
            Swal.fire('Error!', 'There was a problem deleting the Book.', 'error');
            console.error(error);
          }
        });
      }
    });
  }
  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        this.dummyImg = base64String
        const strippedBase64 = base64String.replace(/^data:image\/[a-z]+;base64,/, '');
        this.bookForm.patchValue({ image: strippedBase64 })
      };
      reader.readAsDataURL(file);
    }
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
        this.bookForm.patchValue({grade:gradeId});
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

  getGrade(id: any): string {
    const grade = this.grades.find(g => g.id === id);
    return grade ? grade.name : 'Unknown Grade';
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
