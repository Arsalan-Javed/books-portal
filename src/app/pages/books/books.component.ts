import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BookService } from './book.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SweetAlertOptions } from 'sweetalert2';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import Swal from 'sweetalert2';
import { Book, Grade, Category } from 'src/app/parents/services/modal';


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
  category: Category = { name: '' };
  grades: Grade[] = []
  categories: Category[] = []
  dummyImg: string = './assets/images/book.jpg'
  isLoading:boolean = false
  isViewMode: boolean = false;
  filters = {
    name:'',
    category: '',
    grade: ''
  };
  filteredBooks:any = [];
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
    this.isLoading = true
    this.getGrades();
  }


  initForm() {
    this.bookForm = this.fb.group({
      bookName: ['', Validators.required],
      image: ['', Validators.required],
      grade: [null, Validators.required],
      category: [null, Validators.required],
      academicYear: ['', Validators.required],
      description: ['', Validators.required],
      quantity: [0, [Validators.required, Validators.min(1)]],
      price: [0, [Validators.required, Validators.min(0)]]
    });
  }

  open(content: any) {
    this.bookForm.enable();
    this.isViewMode = false
    this.currentBookId = ''
    this.dummyImg = './assets/images/book.jpg'
    this.bookForm.reset({
      bookName: '',
      image: '',
      grade:null,
      category:null,
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
    this.bookForm.enable();
    this.isViewMode = false
    this.currentBookId = book?.id
    this.bookForm.patchValue(book);
    this.modalService.open(modal, { size: 'lg', centered: true });
  }
  viewBook(modal: any, book: Book) {
    this.isViewMode = true;
    this.currentBookId = book?.id
    this.bookForm.patchValue(book);
    this.bookForm.disable();
    this.modalService.open(modal, { size: 'lg', centered: true });
  }

  loadBooks() {
    this.bookService.getBooks().subscribe((books) => {
      this.books = books.map(book => ({
        ...book,
        grade: this.getGrade(book.grade),
        category: this.getCategories(book.category),
      }));
      this.isLoading = false
      this.applyFilters()
      this.cdr.detectChanges();
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
    this.bookService.getCategories().subscribe((cat) => {
      this.categories = cat;
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

  openCat(content: any) {
    this.category = { name: '' }
    this.modalService.open(content, { size: 'md', centered: true });
  }
  submitType(modal: any) {
    this.bookService.addType(this.category).subscribe({
      next: (id) => {
        this.showAlert(this.successAlert);
        this.bookForm.patchValue({category:id});
        modal.close();
        this.getTypes()
      },
      error: (err) => {
        console.error('Error adding Category:', err.message);
        this.errorAlert = {
          icon: 'error',
          title: 'Error!',
          text: err.message,
        };
        this.showAlert(this.errorAlert)
      }
    });
  }
  deleteType(id: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this Type?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.bookService.deleteCategory(id).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'The Type has been deleted.', 'success');
            this.getTypes();
          },
          error: (error) => {
            Swal.fire('Error!', 'There was a problem deleting the Type.', 'error');
            console.error(error);
          }
        });
      }
    });
  }

  getCategories(id: any): string {
    const type = this.categories.find(t => t.id === id);
    return type ? type.name : 'Unknown Type';
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
  applyFilters() {
    const { name, category, grade } = this.filters;
    const lowerName = name?.toLowerCase() || '';

    this.filteredBooks = this.books.filter(book =>
      (!name || book.bookName.toLowerCase().includes(lowerName)) &&
      (!category || book.category === this.getCategories(category)) &&
      (!grade || book.grade === this.getGrade(grade))
    );
  }

}
