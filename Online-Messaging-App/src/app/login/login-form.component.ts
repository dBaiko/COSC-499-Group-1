import {Component, NgModule, OnInit} from '@angular/core';
import {FormControl, FormGroup, NgForm} from "@angular/forms";
import {AuthenticationService} from "../shared/authentication.service";
import {CommonService} from "../shared/common.service";
import {Validators} from "@angular/forms";

@Component({
  selector: 'login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent implements OnInit {

  loginForm: FormGroup;

  constructor(public common: CommonService, private auth: AuthenticationService) {
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

  loginSubmit(form: NgForm) {
    this.login(form.value.username, form.value.password);
  }

  login(username, password) {
    this.auth.login(username, password).subscribe(
      (data) => {
        console.log(data);
        this.common.moveToHome();
      },
      (err) => {
        console.log(err);
      }
    );
  }

}
