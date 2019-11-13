import {Component, NgModule, OnInit} from '@angular/core';
import {AuthenticationService} from "../shared/authentication.service";
import {NgForm} from "@angular/forms";
import { Router } from "@angular/router";

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit {

  constructor(private auth: AuthenticationService, private router: Router) { }

  ngOnInit() {
  }

  logoutSubmit(form: NgForm) {
    this.logout();
  }

  logout() {
    this.auth.logOut();
    this.router.navigate(['/login']);
  }


}
