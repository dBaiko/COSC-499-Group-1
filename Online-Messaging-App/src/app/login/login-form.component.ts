import {Component, NgModule, OnInit} from '@angular/core';
import {FormControl, FormGroup, NgForm} from "@angular/forms";
import {AuthenticationService} from "../shared/authentication.service";
import {CommonService} from "../shared/common.service";
import {Validators} from "@angular/forms";
import {FormValidationService, ParentErrorStateMatcher} from "../shared/form-validation.service";

@Component({
  selector: 'login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent implements OnInit {

  loginForm: FormGroup;

  submitAttempt: boolean = false;

  constructor(public common: CommonService, private auth: AuthenticationService, private formValidationService: FormValidationService) {
  }

  ngOnInit() {
    this.loginForm = new FormGroup({
      'username': new FormControl('', Validators.compose([
        Validators.required
      ])),
      'password': new FormControl('', Validators.compose([
        Validators.required
      ]))
    })
  }

  loginSubmit(value): void {
    this.submitAttempt = true;
    this.login(value.username, value.password);
  }

  login(username, password): void {
    this.auth.login(username, password).subscribe(
      (data) => {
        console.log(data);
        this.common.moveToHome();
      },
      (err) => {
        if(err.code == "NotAuthorizedException") {
          this.loginForm.get('username').setErrors({'invalidLogin': true});
        }
      }
    );
  }

}
