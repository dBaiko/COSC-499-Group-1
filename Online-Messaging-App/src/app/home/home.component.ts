import {Component, NgModule, OnInit} from '@angular/core';
import {AuthenticationService} from "../shared/authentication.service";
import {Common} from "../shared/common";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {

  userLoggedIn = false;

  constructor(private auth: AuthenticationService, public common: Common) {
    this.userLoggedIn = auth.isLoggedIn();
  }

  ngOnInit() {
  }

}
