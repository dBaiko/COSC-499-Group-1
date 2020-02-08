import { Component, OnInit } from "@angular/core";
import { AuthenticationService } from "../../shared/authentication.service";
import {APIConfig, Constants} from "../../shared/app-config";
import {HttpClient} from "@angular/common/http";

@Component({
    selector: "app-header",
    templateUrl: "./header.component.html",
    styleUrls: ["./header.component.scss"]
})
export class HeaderComponent implements OnInit {
    userLoggedIn = false;
    user;

    constructor(private auth: AuthenticationService) {
        this.userLoggedIn = auth.isLoggedIn();
    }

    ngOnInit(): void {
        if (this.userLoggedIn==true)
        this.user = this.auth.getAuthenticatedUser();
        console.log(this.user);
    }


}
