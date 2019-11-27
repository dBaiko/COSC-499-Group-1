import {AfterViewChecked, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AuthenticationService} from "../../shared/authentication.service";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  userloggedIn = false;

  constructor(private auth: AuthenticationService) {
    this.userloggedIn = auth.isLoggedIn();
  }

  ngOnInit() {
  }

}
