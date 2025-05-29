import { ChangeDetectorRef, Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Grade } from 'src/app/parents/services/modal';
import { BookService } from '../books/book.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-grades',
  templateUrl: './grades.component.html',
  styleUrl: './grades.component.scss'
})
export class GradesComponent {
  isLoading: boolean = false
  grades: Grade[] = []
  grade: Grade = { name: '' };
  gradeId:any

  constructor(
    private modalService: NgbModal,
    private bookService: BookService,
    private cdr: ChangeDetectorRef
  ) {  }

  ngOnInit() {
    this.isLoading = true
    this.getGrades();
  }
  getGrades() {
    this.bookService.getGrades().subscribe((grades) => {
      this.grades = grades.filter(g => !g.isDeleted);
      this.isLoading = false
      this.cdr.detectChanges();
    })
  }
  openGrade(content: any) {
    this.grade = { name: '' }
    this.gradeId = null
    this.modalService.open(content, { size: 'md', centered: true });
  }
  edit(content: any,grade:any) {
    this.grade = { name: grade.name }
    this.gradeId = grade.id
    this.modalService.open(content, { size: 'md', centered: true });
  }
  submit(modal: any) {
    if (this.gradeId) {
      this.bookService.updateGrade(this.gradeId, this.grade).subscribe({
        next: (id) => {
          this.getGrades()
          modal.close();
          Swal.fire({
            icon: 'success',
            title: 'Update',
            text: 'Grade added successfully!',
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
      this.bookService.addGrade(this.grade).subscribe({
        next: (id) => {
          modal.close();
          this.getGrades()
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Grade added successfully!',
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
        this.bookService.updateGrade(id,{isDeleted:true}).subscribe({
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
}
