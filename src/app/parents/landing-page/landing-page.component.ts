import { filter } from 'rxjs/operators';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { Category, Grade, School } from '../services/modal';
import { BookService } from 'src/app/pages/books/book.service';
import { BundleService } from 'src/app/pages/bundle/bundle.service';
import { Router } from '@angular/router';
import { combineLatest } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatButtonModule,
    MatToolbarModule,
    MatGridListModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatInputModule,
  ],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss',
})
export class LandingPageComponent {
  onSubmit() {
    throw new Error('Method not implemented.');
  }
  isLoading: boolean = false;
  grades: Grade[] = [];
  categories: Category[] = [];
  schools: School[] = [];
  filters = {
    name: '',
    category: '',
    school: '',
    grade: '',
  };
  filteredBooks: any = [];
  filteredBundles: any = [];
  locations: any;

  fb = inject(FormBuilder);

  form1 = this.fb.group({
    school: [],
    grade: [],
  });

  form2 = this.fb.group({
    location: [],
    grade: [],
    subject: [],
  });
  constructor(
    private bookService: BookService,
    private cdr: ChangeDetectorRef,
    private bundleService: BundleService,
    private router: Router
  ) {}
  ngOnInit() {
    this.isLoading = true;
    combineLatest([
      this.getGrades(),
      this.getSchools(),
      this.getCategories(),
    ]).subscribe(([grades, schools, categories]) => {
      this.grades = grades;
      this.schools = schools.filter((s) => !s.isDeleted);
      this.categories = categories;
      this.isLoading = false;
      this.cdr.detectChanges();
    });
  }
  applyFilters() {
    const { name, category, school, grade } = this.filters;
    const lowerName = name?.toLowerCase() || '';
    this.router.navigate(['/browse'], {
      state: {
        filters: {
          name: lowerName,
          category,
          school,
          grade,
        },
      },
    });
  }
  //   getGrades() {
  //     this.bookService.getGrades().subscribe((grades) => {
  //       this.grades = grades;
  //       this.isLoading = false
  //       this.getCategories()
  //       this.getSchools()
  //       this.cdr.detectChanges();
  //   })
  // }

  //   getCategories() {
  //     this.bookService.getCategories().subscribe((cat) => {
  //       this.categories = cat
  //     })
  //   }
  //   getSchools() {
  //     this.bundleService.getSchool().subscribe((schools) => {
  //       this.schools = schools
  //     })
  //   }
  getGrades() {
    return this.bookService.getGrades();
  }

  getCategories() {
    return this.bookService.getCategories();
  }
  getSchools() {
    return this.bundleService.getSchool();
  }

  browseKits(filters?: any) {
    if (filters.school || filters.grade) {
      console.log('filters', filters);
      this.filters = {
        name: '',
        category: '',
        school: filters?.school?.id || '',
        grade: filters?.grade?.id ?? '',
      };
      // this.router.navigate(['/browse']);
      this.applyFilters();
    } else {
      this.router.navigate(['/browse']);
    }
  }

  findTutor() {
    this.router.navigate(['/tutors']);
  }
}
