/* tslint:disable:no-console */
import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from "../shared/authentication.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {APIConfig, Constants} from "../shared/app-config";
import {CommonService} from "../shared/common.service";
import {FormValidationService, ParentErrorStateMatcher} from "../shared/form-validation.service";

const USER_EXISTS_EX = "UsernameExistsException";

interface User {
  username: string,
  email: string,
  firstName: string,
  lastName: string
}

@Component({
  selector: 'register-form',
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.scss'],
})
export class RegisterFormComponent implements OnInit {

  url: string = APIConfig.RegisterAPI;

  registerForm: FormGroup;

  matchingPasswordForm: FormGroup;

  submitAttempt: boolean = false;

  matcher = new ParentErrorStateMatcher();

  constructor(private auth: AuthenticationService, private http: HttpClient, public common: CommonService, private formValidationService: FormValidationService) {
  }

  ngOnInit(): void {
    this.matchingPasswordForm = new FormGroup({
        password: new FormControl('', Validators.compose([
          Validators.required,
          Validators.minLength(8)
        ])),
        confirmPassword: new FormControl('', Validators.compose([
          Validators.required
        ])),
      }, {validators: this.formValidationService.checkIfPasswordsMatch}
    );
    this.registerForm = new FormGroup({
      username: new FormControl('', Validators.compose([
        Validators.required,
        this.formValidationService.isAlphanumericValidator
      ])),
      matchingPasswords: this.matchingPasswordForm,
      firstName: new FormControl('', Validators.compose([
        Validators.required,
        this.formValidationService.isAlphanumericValidator
      ])),
      lastName: new FormControl('', Validators.compose([
        Validators.required,
        this.formValidationService.isAlphanumericValidator
      ])),
      email: new FormControl('', Validators.compose([
        Validators.required,
        Validators.email
      ]))
    });
  }

  registerSubmit(value: any): void {
    this.submitAttempt = true;
    if (this.registerForm.valid) {
      this.register(value.username, value.matchingPasswords.password, value.email, value.firstName, value.lastName);
    }
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

          });
      },
      (err) => {
        if (err.code == USER_EXISTS_EX) {
          this.registerForm.get(Constants.USERNAME).setErrors({alreadyTaken: true});
        }
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
    return this.http.post(this.url, user, httpOptions).toPromise();
  }

}
