import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { first } from 'rxjs/operators';
import { AuthFirebaseService } from '../../services/auth.firebase.service';
import Swal from 'sweetalert2';

enum ErrorStates {
  NotSubmitted,
  HasError,
  NoError,
}

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup;
  errorState: ErrorStates = ErrorStates.NotSubmitted;
  errorStates = ErrorStates;
  isLoading$: Observable<boolean>;

  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
  constructor(private fb: FormBuilder, private authService: AuthFirebaseService) {
  }

  ngOnInit(): void {
    this.initForm();
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.forgotPasswordForm.controls;
  }

  initForm() {
    this.forgotPasswordForm = this.fb.group({
      email: [
        'admin@demo.com',
        Validators.compose([
          Validators.required,
          Validators.email,
          Validators.minLength(3),
          Validators.maxLength(320), // https://stackoverflow.com/questions/386294/what-is-the-maximum-length-of-a-valid-email-address
        ]),
      ],
    });
  }

  // this.errorState = ErrorStates.NotSubmitted;
  // const forgotPasswordSubscr = this.authService
  //   .forgotPassword(this.f.email.value)
  //   .pipe(first())
  //   .subscribe((result: boolean) => {
  //     this.errorState = result ? ErrorStates.NoError : ErrorStates.HasError;
  //   });
  // this.unsubscribe.push(forgotPasswordSubscr);

  submit() {
    const mail = this.f.email.value;

    this.authService.resetPassword(mail)
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Email Sent',
          text: 'Password reset email has been sent. Please check your inbox.',
          timer: 3000,
          showConfirmButton: false,
        });
      })
      .catch((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Something went wrong. Please try again.',
          timer: 2000,
          showConfirmButton: false,
        });
      });
  }


}
