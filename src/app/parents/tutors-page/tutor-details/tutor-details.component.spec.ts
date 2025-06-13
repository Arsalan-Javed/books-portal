import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TutorDetailsComponent } from './tutor-details.component';

describe('TutorDetailsComponent', () => {
  let component: TutorDetailsComponent;
  let fixture: ComponentFixture<TutorDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TutorDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TutorDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
