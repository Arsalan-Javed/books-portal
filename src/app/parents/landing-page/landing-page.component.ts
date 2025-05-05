import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { Category, Grade, School } from '../services/modal';
import { BookService } from 'src/app/pages/books/book.service';
import { BundleService } from 'src/app/pages/bundle/bundle.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent {
  isLoading:boolean = false
  grades: Grade[] = []
  categories: Category[] = []
  schools: School[] = [];
  filters = {
    name:'',
    category: '',
    school: '',
    grade: ''
  };
  filteredBooks:any = [];
  filteredBundles:any = [];
  constructor(
    private bookService: BookService,
    private cdr: ChangeDetectorRef,
    private bundleService: BundleService,
    private router: Router
  ) {
  }
  ngOnInit() {
    this.isLoading = true
    this.getGrades();
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
          grade
        }
      }
    });

  }
  getGrades() {
    this.bookService.getGrades().subscribe((grades) => {
      this.grades = grades;
      this.isLoading = false
      this.getCategories()
      this.getSchools()
      this.cdr.detectChanges();
  })
}

  getCategories() {
    this.bookService.getCategories().subscribe((cat) => {
      this.categories = cat
    })
  }
  getSchools() {
    this.bundleService.getSchool().subscribe((schools) => {
      this.schools = schools
    })
  }

}
