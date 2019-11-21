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

  error = '';

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

        this.addUser(username, email, firstName, lastName)
          .then((data) => {
            console.log(data);
            this.common.routeTo(Constants.LOGIN_ROUTE);
          })
          .catch((err) => {
            console.log(err);
          });
      },
      (err) => {
        console.log(err);
        this.error = 'Registration Error has occurred';
      }
    );
  }

  addUser(username: string, email: string, firstName: string, lastName: string): Promise<Object> {
    let user: User = {
      username: username,
      email: email,
      firstName: firstName,
      lastName: lastName
    };

    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post(this.url, user, httpOptions).toPromise()
  }

}
