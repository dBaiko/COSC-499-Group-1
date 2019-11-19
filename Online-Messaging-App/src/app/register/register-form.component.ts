/* tslint:disable:no-console */
import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from "../shared/authentication.service";
import {NgForm} from "@angular/forms";
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {APIConfig, Constants} from "../shared/app-config";
import {CommonService} from "../shared/common.service";

interface User {
  username: string,
  email: string,
  firstName: string,
  lastName: string
}

@Component({
  selector: 'register-form',
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.scss']
})
export class RegisterFormComponent implements OnInit {

  confirmCode = false;
  codeWasConfirmed = false;
  error = '';

  username: string;
  email: string;
  firstName: string;
  lastName: string;

  url = APIConfig.RegisterAPI;

  constructor(private auth: AuthenticationService, private http: HttpClient, public common: CommonService) {
  }

  ngOnInit() {
  }

  registerSubmit(form: NgForm): void {
    this.register(form.value.username, form.value.password, form.value.email, form.value.firstName, form.value.lastName);
  }

  register(username: string, password: string, email: string, firstName: string, lastName: string): void {
    this.auth.register(username, password, email, firstName, lastName).subscribe(
      () => {
        this.confirmCode = true;

        this.username = username;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;

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
      () => {
        this.codeWasConfirmed = true;
        this.confirmCode = false;

        this.addUser();

        this.common.routeTo(Constants.LOGIN_ROUTE)

      },
      (err) => {
        console.log(err);
        this.error = 'Confirm Authorization Error has occurred';
      });
  }

  addUser(): void {
    let user: User = {
      username: this.username,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName
    };

    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    this.http.post(this.url, user, httpOptions).subscribe(
      data => {
        console.log(data);
      },
      err => {
        console.log(err)
      }
    );

  }

}
