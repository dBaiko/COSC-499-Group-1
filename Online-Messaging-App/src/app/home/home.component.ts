import {AfterViewInit, Component, OnInit} from '@angular/core';
import {AuthenticationService} from "../shared/authentication.service";
import {CommonService} from "../shared/common.service";
import {FormGroup, FormBuilder} from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {

  container: HTMLElement;

  userLoggedIn = false;
  options: FormGroup;

    constructor(private auth: AuthenticationService, public common: CommonService, fb: FormBuilder) {
      this.userLoggedIn = auth.isLoggedIn();
      this.options = fb.group({
        bottom: 0,
        fixed: false,
        top: 0
      });
    }

  ngOnInit() {
  }

}
