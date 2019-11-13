import {Component, NgModule, OnInit} from '@angular/core';
import {NgForm} from "@angular/forms";
import {AuthenticationService} from "../shared/authentication.service";
import {Common} from "../shared/common";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(public common: Common, private auth: AuthenticationService) { }

  ngOnInit() {
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
