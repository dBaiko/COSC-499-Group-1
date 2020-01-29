import {Component, OnInit} from "@angular/core";
import {APIConfig, Constants} from "../../shared/app-config";
import {AuthenticationService} from "../../shared/authentication.service";
import {HttpClient} from "@angular/common/http";


@Component({
    selector: "app-profile",
    templateUrl: "./profile.component.html",
    styleUrls: ["./profile.component.scss"]
})
export class ProfileComponent implements OnInit {
    user;
    private usersAPI = APIConfig.usersAPI;

    constructor(private auth: AuthenticationService, private http: HttpClient) {
    }

    ngOnInit() {
        this.getUserInfo();
    }

    getUserInfo() {
        this.http.get(this.usersAPI + this.auth.getAuthenticatedUser().getUsername(), Constants.HTTP_OPTIONS).subscribe((data) => {
                this.user = data;
                console.log(this.user);
            },
            err => {
                console.log(err);
            });
    }

}
