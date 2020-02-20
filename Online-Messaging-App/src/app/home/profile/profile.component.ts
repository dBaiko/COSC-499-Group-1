import { Component, OnInit } from "@angular/core";
import { APIConfig } from "../../shared/app-config";
import { AuthenticationService } from "../../shared/authentication.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";

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

    getUserInfo(): void {

        this.auth.getCurrentSessionId().subscribe(
            (data) => {
                let httpHeaders = {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + data.getJwtToken()
                    })
                };

                this.http.get(this.usersAPI + this.auth.getAuthenticatedUser().getUsername(), httpHeaders).subscribe(
                    (data) => {
                        this.user = data;
                    },
                    (err) => {
                        console.log(err);
                    }
                );
            },
            (err) => {
                console.log(err);
            }
        );


    }
}
