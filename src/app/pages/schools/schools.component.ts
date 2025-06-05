import { ChangeDetectorRef, Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BookService } from '../books/book.service';
import { BundleService } from '../bundle/bundle.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { School } from 'src/app/parents/services/modal';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-schools',
  templateUrl: './schools.component.html',
  styleUrl: './schools.component.scss',
})
export class SchoolsComponent {
  isLoading: boolean = false;
  schools: School[] = [];
  filterSchool: any;
  schoolForm!: FormGroup;
  selectedSchoolId: any;
  school: any;
  isViewMode:boolean = false;
  dummyImg: string = '';
  constructor(
    private modalService: NgbModal,
    private bundleService: BundleService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.isLoading = true;
    this.getSchool();
    this.schoolForm = this.fb.group({
      name: [''],
      image: [''],
      representative: [''],
      phoneNumber: [''],
      address: [''],
    });
  }
  getSchool() {
    this.bundleService.getSchool().subscribe((schools) => {
      this.schools = schools.filter((s) => !s.isDeleted);
      this.schools.sort((a, b) => a.name.localeCompare(b.name));
      this.filterSchool = this.schools;
      this.isLoading = false;
      this.applyFilters();
      this.cdr.detectChanges();
    });
  }
  open(content: any) {
    this.dummyImg = './assets/images/school.png'
    this.isViewMode = false;
    this.schoolForm.enable();
    this.selectedSchoolId = null;
    this.schoolForm.reset();
    this.modalService.open(content, { size: 'md', centered: true });
  }
  edit(modal: any, school: School) {
    this.isViewMode = false;
    this.schoolForm.enable();
    this.selectedSchoolId = school.id;
    this.schoolForm.patchValue(school);
    this.modalService.open(modal, { size: 'lg', centered: true });
  }

  submitSchool(modal: any) {
    const schoolData: School = this.schoolForm.value;

    if (this.selectedSchoolId) {
      this.bundleService
        .updateSchool(this.selectedSchoolId, schoolData)
        .subscribe({
          next: () => {
            modal.close();
            this.getSchool();
            Swal.fire({
              icon: 'success',
              title: 'Update',
              text: 'School updated successfully!',
              timer: 2000,
              showConfirmButton: false,
            });
          },
          error: (err: any) => {
            console.error('Error updating School:', err.message);
            Swal.fire({
              icon: 'error',
              title: 'Update Failed',
              text: 'An error occurred while updating the school.',
              timer: 2000,
              showConfirmButton: false,
            });
          },
        });
    } else {
      this.bundleService.addSchool(schoolData).subscribe({
        next: (id) => {
          modal.close();
          this.getSchool();
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'School added successfully!',
            timer: 2000,
            showConfirmButton: false,
          });
        },
        error: (err) => {
          console.error('Error adding School:', err.message);
          Swal.fire({
            icon: 'error',
            title: 'Add Failed',
            text: 'An error occurred while adding the school.',
            timer: 2000,
            showConfirmButton: false,
          });
        },
      });
    }
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
        this.bundleService.updateSchool(id, { isDeleted: true }).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'The school has been deleted.', 'success');
            this.getSchool();
          },
          error: (error) => {
            Swal.fire(
              'Error!',
              'There was a problem deleting the school.',
              'error'
            );
            console.error(error);
          },
        });
      }
    });
  }

  view(modal: any, school: School) {
    this.isViewMode = true;
    this.selectedSchoolId = school.id;
    this.schoolForm.patchValue(school);
    this.schoolForm.disable();
    this.modalService.open(modal, { size: 'lg', centered: true });
  }
  applyFilters() {
    const name = this.school;
    const lowerName = name?.toLowerCase() || '';
    this.filterSchool = this.schools.filter(
      (s) => !name || s.name.toLowerCase().includes(lowerName)
    );
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        this.dummyImg = base64String
        const strippedBase64 = base64String.replace(/^data:image\/[a-z]+;base64,/, '');
        this.schoolForm.patchValue({ image: strippedBase64 })
      };
      reader.readAsDataURL(file);
    }
  }
}
