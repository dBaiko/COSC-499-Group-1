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
    private usersAPI = APIConfig.usersAPI;

    constructor(private auth: AuthenticationService, private http: HttpClient) {
        this.userLoggedIn = auth.isLoggedIn();
    }

    ngOnInit(): void {
        if (this.userLoggedIn==true)
        this.getUserInfo();
    }

    getUserInfo(): void {
        this.http.get(this.usersAPI + this.auth.getAuthenticatedUser().getUsername(), Constants.HTTP_OPTIONS).subscribe(
            (data) => {
                this.user = data;
            },
            (err) => {
                console.log(err);
            }
        );
    }
}
