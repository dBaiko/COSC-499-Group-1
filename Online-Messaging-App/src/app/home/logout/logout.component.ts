import {Component, NgModule, OnInit} from '@angular/core';
import {AuthenticationService} from "../../shared/authentication.service";
import {NgForm} from "@angular/forms";
import { Router } from "@angular/router";
import {Common} from "../../shared/common";
import {Constants} from "../../config/app-config";

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit {

  constructor(private auth: AuthenticationService, public common: Common) { }

  ngOnInit() {
  }

  logoutSubmit(form: NgForm) {
    this.logout();
  }

  logout() {
    this.auth.logOut();
    this.common.routeTo(Constants.LOGIN_ROUTE);
  }


}
