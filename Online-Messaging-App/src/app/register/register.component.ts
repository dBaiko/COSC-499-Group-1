import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from "../shared/authentication.service";
import {Router} from "@angular/router";
import {NgForm} from "@angular/forms";
<<<<<<< HEAD
=======
import {HttpClient, HttpHeaders, HttpRequest} from '@angular/common/http';

interface User {
  username: string,
  email: string,
  firstName: string,
  lastName: string
}

>>>>>>> 7d5e1b6e456f3d7b21cd33b191550645b2511816

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  confirmCode = false;
  codeWasConfirmed = false;
  error = '';

  username: string;
  email: string;
  firstName: string;
  lastName: string;

  url = 'http://localhost:8080/users/registerUser';

  constructor(private auth: AuthenticationService, private _router: Router, private http: HttpClient) {
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

<<<<<<< HEAD
        // add code to send user info to dynamodb
=======
        this.username = username;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
>>>>>>> 7d5e1b6e456f3d7b21cd33b191550645b2511816

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
<<<<<<< HEAD
=======

        this.addUser();

>>>>>>> 7d5e1b6e456f3d7b21cd33b191550645b2511816
      },
      (err) => {
        console.log(err);
        this.error = 'Confirm Authorization Error has occurred';
      });
  }

<<<<<<< HEAD
=======
  addUser() {
    let user: User = {
      username: this.username,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName
    };

    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    }

    this.http.post(this.url, user, httpOptions).subscribe(data => {console.log(data);}, err => {console.log(err)})

  }

>>>>>>> 7d5e1b6e456f3d7b21cd33b191550645b2511816
}
