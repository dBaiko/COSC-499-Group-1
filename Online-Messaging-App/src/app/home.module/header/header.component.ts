import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from "../../shared/authentication.service";

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

    userLoggedIn = false;

    constructor(private auth: AuthenticationService) {
        this.userLoggedIn = auth.isLoggedIn();
    }

    ngOnInit(): void {
    }

}
