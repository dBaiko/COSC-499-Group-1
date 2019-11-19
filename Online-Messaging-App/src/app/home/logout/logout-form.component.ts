import {Component, NgModule, OnInit} from '@angular/core';
import {AuthenticationService} from "../../shared/authentication.service";
import {NgForm} from "@angular/forms";
import { Router } from "@angular/router";
import {CommonService} from "../../shared/common.service";
import {Constants} from "../../shared/app-config";

@Component({
  selector: 'logout-form',
  templateUrl: './logout-form.component.html',
  styleUrls: ['./logout-form.component.scss']
})
export class LogoutFormComponent implements OnInit {

  constructor(private auth: AuthenticationService, public common: CommonService) { }

  ngOnInit() {
  }

  logoutSubmit(form: NgForm): void {
    this.logout();
  }

  logout(): void {
    this.auth.logOut();
    this.common.routeTo(Constants.LOGIN_ROUTE);
  }


}
