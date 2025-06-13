import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-tutor-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
  ],
  templateUrl: './tutor-details.component.html',
  styleUrl: './tutor-details.component.scss',
})
export class TutorDetailsComponent {
  tutors = [
    {
      id: 1,
      name: 'Catalina Orrego',
      title: 'I will teach your child spanish with montessori techniques',
      rating: 5.0,
      reviews: 7,
      price: 10,
      image: '../../../../assets/images/tutor1.png',
      summary:
        'Experienced Math and Science tutor with 8+ years of helping students excel. Specializes in high school and college entrance exams.',
      resumeUrl: 'assets/resumes/jane-doe.pdf',

      subject: ['Spanish', 'English', 'Math', 'Science'],
    },
    {
      id: 2,
      name: 'Ginna O.',
      title: 'I will teach you spanish, lessons in 6 months',
      rating: 5.0,
      reviews: 24,
      price: 20,
      image: '../../../../assets/images/tutor1.png',
      summary:
        'Experienced Math and Science tutor with 8+ years of helping students excel. Specializes in high school and college entrance exams.',
      resumeUrl: 'assets/resumes/jane-doe.pdf',
      subject: ['Spanish', 'English', 'Math', 'Science'],
    },
    {
      id: 3,
      name: 'Ginna O.',
      title: 'I will teach you spanish, lessons in 6 months',
      rating: 5.0,
      reviews: 24,
      price: 20,
      image: '../../../../../assets/images/tutor1.png',
      summary:
        'Experienced Math and Science tutor with 8+ years of helping students excel. Specializes in high school and college entrance exams.',
      resumeUrl: 'assets/resumes/jane-doe.pdf',
      subject: ['Spanish', 'English', 'Math', 'Science'],
    },
    {
      id: 4,
      name: 'Ginna O.',
      title: 'I will teach you spanish, lessons in 6 months',
      rating: 5.0,
      reviews: 24,
      price: 20,
      image: '../../../../assets/images/tutor1.png',
      summary:
        'Experienced Math and Science tutor with 8+ years of helping students excel. Specializes in high school and college entrance exams.',
      resumeUrl: 'assets/resumes/jane-doe.pdf',
      subject: ['Spanish', 'English'],
    },
    {
      id: 5,
      name: 'Ginna O.',
      title: 'I will teach you spanish, lessons in 6 months',
      rating: 5.0,
      reviews: 24,
      price: 20,
      image: '../../../../assets/images/tutor1.png',
      summary:
        'Experienced Math and Science tutor with 8+ years of helping students excel. Specializes in high school and college entrance exams.',
      resumeUrl: 'assets/resumes/jane-doe.pdf',
    },
    {
      id: 6,
      name: 'Ginna O.',
      title: 'I will teach you spanish, lessons in 6 months',
      rating: 5.0,
      reviews: 24,
      price: 20,
      image: '../../../../assets/images/tutor1.png',
      summary:
        'Experienced Math and Science tutor with 8+ years of helping students excel. Specializes in high school and college entrance exams.',
      resumeUrl: 'assets/resumes/jane-doe.pdf',
    },
    // Add more tutors here...
  ];

  selectedTutor: any;
  pastWorks = [
    {
      image: '../../../../assets/images/tutor1.png',
      title: 'Algebra Bootcamp',
      summary:
        'Helped 20+ students master algebra fundamentals in a 2-week intensive course.',
    },
    {
      image: '../../../../assets/images/tutor1.png',
      title: 'SAT Prep',
      summary:
        'Guided students to an average 150-point improvement on their SAT Math scores.',
    },
    {
      image: '../../../../assets/images/tutor3.png',
      title: 'Science Fair Mentorship',
      summary:
        'Mentored a team that won 1st place in the regional science fair.',
    },
    {
      image: '../../../../assets/images/tutor1.png',
      title: 'Calculus Crash Course',
      summary: 'Delivered a 5-day crash course for AP Calculus students.',
    },
  ];

  orderForm: FormGroup;
  orderSuccess = false;

  route = inject(ActivatedRoute);

  constructor(private fb: FormBuilder) {
    this.orderForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      details: ['', Validators.required],
    });
    const tutorId = this.route.snapshot.paramMap.get('id');
    this.selectedTutor = this.tutors.filter((t) => t.id == Number(tutorId))[0];
    console.log(this.selectedTutor);
  }

  submitOrder() {
    if (this.orderForm.valid) {
      this.orderSuccess = true;
      this.orderForm.reset();
      setTimeout(() => (this.orderSuccess = false), 4000);
    }
  }
}
