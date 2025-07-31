import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tutors-pge',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
  ],
  templateUrl: './tutors-page.component.html',
  styleUrl: './tutors-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TutorsPageComponent implements OnInit {
  username = 'shisyla';

  infoCards = [
    {
      title: 'Post a project brief',
      subtitle: 'Get tailored offers for your needs.',
    },
    {
      title: 'Reply to Arsal',
      subtitle: 'you have commented this line and now it just shoing...',
    },
    {
      title: 'Leave Junald Iqbal a review',
      subtitle: 'You paid $130 and it took 4 days.',
    },
  ];

  tutors = [
    {
      id: 1,
      name: 'Catalina Orrego',
      title: 'I will teach your child spanish with montessori techniques',
      rating: 5.0,
      reviews: 7,
      price: 10,
      image: 'assets/tutors/catalina.png',
      subject: ['Spanish', 'English', 'Math', 'Science'],
    },
    {
      id: 2,
      name: 'Ginna O.',
      title: 'I will teach you spanish, lessons in 6 months',
      rating: 5.0,
      reviews: 24,
      price: 20,
      image: 'assets/tutors/ginna.png',
      subject: ['Spanish', 'English', 'Math', 'Science'],
    },
    {
      id: 3,
      name: 'Ginna O.',
      title: 'I will teach you spanish, lessons in 6 months',
      rating: 5.0,
      reviews: 24,
      price: 20,
      image: 'assets/tutors/ginna.png',
      subject: ['Spanish', 'English', 'Math', 'Science'],
    },
    {
      id: 4,
      name: 'Ginna O.',
      title: 'I will teach you spanish, lessons in 6 months',
      rating: 5.0,
      reviews: 24,
      price: 20,
      image: 'assets/tutors/ginna.png',
      subject: ['Spanish', 'English'],
    },
    {
      id: 5,
      name: 'Ginna O.',
      title: 'I will teach you spanish, lessons in 6 months',
      rating: 5.0,
      reviews: 24,
      price: 20,
      image: 'assets/tutors/ginna.png',
    },
    {
      id: 6,
      name: 'Ginna O.',
      title: 'I will teach you spanish, lessons in 6 months',
      rating: 5.0,
      reviews: 24,
      price: 20,
      image: 'assets/tutors/ginna.png',
    },
    // Add more tutors here...
  ];

  subjects = [
    { name: 'Spanish', icon: 'assets/icons/spanish.svg' },
    { name: 'English', icon: 'assets/icons/english.svg' },
    { name: 'Math', icon: 'assets/icons/math.svg' },
    { name: 'Science', icon: 'assets/icons/science.svg' },
    { name: 'History', icon: 'assets/icons/history.svg' },
    { name: 'Art', icon: 'assets/icons/art.svg' },
    { name: 'Music', icon: 'assets/icons/music.svg' },
    { name: 'Programming', icon: 'assets/icons/programming.svg' },
  ];

  router = inject(Router);
  ngOnInit(): void {
    // Initialization logic can go here
  }

  openTutorDetail(tutor: any) {
    // Logic to open tutor detail modal or navigate to tutor detail page
    console.log('Opening tutor detail for:', tutor);
    this.router.navigate(['/tutors', tutor.id]);
  }
}
