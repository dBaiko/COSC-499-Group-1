import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from "../shared/authentication.service";
import {Router} from "@angular/router";
import {NgForm} from "@angular/forms";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  confirmCode = false;
  codeWasConfirmed = false;
  error = '';

  constructor(private auth: AuthenticationService, private _router: Router) {
  }

  ngOnInit() {
  }

  registerSubmit(form: NgForm) {
    console.log(form.value.email);
    this.register(form.value.username, form.value.password, form.value.email, form.value.firstName, form.value.lastName);
  }

  register(username, password, email, firstName, lastName) {
    console.log(email);
    this.auth.register(username, password, email, firstName, lastName).subscribe(
      (data) => {
        this.confirmCode = true;

        // add code to send user info to dynamodb

      },
      (err) => {
        console.log(err);
        this.error = 'Registration Error has occurred';
      }
    );
  }

  validateAuthCodeSubmit(form: NgForm) {
    this.validateAuthCode(form.value.code);
  }

  validateAuthCode(code) {

    this.auth.confirmAuthCode(code).subscribe(
      (data) => {
        // this._router.navigateByUrl('/');
        this.codeWasConfirmed = true;
        this.confirmCode = false;
      },
      (err) => {
        console.log(err);
        this.error = 'Confirm Authorization Error has occurred';
      });
  }

}
