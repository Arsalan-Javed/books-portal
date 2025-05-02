import { ChangeDetectorRef, Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Category } from 'src/app/parents/services/modal';
import { BookService } from '../books/book.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss'
})
export class CategoriesComponent {
  isLoading: boolean = false
  categories: Category[] = []
  category: Category = { name: '' };
  categoryId:any
  constructor(
    private modalService: NgbModal,
    private bookService: BookService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.isLoading = true
    this.getCategories();
  }

  getCategories() {
    this.bookService.getCategories().subscribe((cat) => {
      this.categories = cat;
      this.isLoading = false
      this.cdr.detectChanges();
    })
  }
  openCat(content: any) {
    this.categoryId = null
    this.category = { name: '' }
    this.modalService.open(content, { size: 'md', centered: true });
  }
  edit(content: any, category: any) {
    this.category = { name: category.name }
    this.categoryId = category.id
    this.modalService.open(content, { size: 'md', centered: true });
  }
  submitType(modal: any) {
    if (this.categoryId) {
      this.bookService.updateCategory(this.categoryId, this.category).subscribe({
        next: (id) => {
          this.getCategories()
          modal.close();
          Swal.fire({
            icon: 'success',
            title: 'Update',
            text: 'Category added successfully!',
            timer: 2000,
            showConfirmButton: false,
          });
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Update Failed',
            text: err.message,
            timer: 2000,
            showConfirmButton: false,
          });
        }
      });
    } else {
      this.bookService.addType(this.category).subscribe({
        next: (id) => {
          modal.close();
          this.getCategories()
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Category added successfully!',
            timer: 2000,
            showConfirmButton: false,
          });
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Update Failed',
            text: err.message,
            timer: 2000,
            showConfirmButton: false,
          });
        }
      });
    }
  }
  deleteCat(id: any) {
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
            this.getCategories();
          },
          error: (error) => {
            Swal.fire('Error!', 'There was a problem deleting the Category.', 'error');
            console.error(error);
          }
        });
      }
    });
  }
}
