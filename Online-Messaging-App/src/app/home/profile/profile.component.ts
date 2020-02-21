import { Component, Input, OnInit } from "@angular/core";
import { APIConfig } from "../../shared/app-config";
import { AuthenticationService } from "../../shared/authentication.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";

interface UserObject {
    username: string;
    email: string;
}

interface ProfileObject {
    username: string;
    firstName: string;
    lastName: string;
}

interface UserProfileObject {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
}

@Component({
    selector: "app-profile",
    templateUrl: "./profile.component.html",
    styleUrls: ["./profile.component.scss"]
})
export class ProfileComponent implements OnInit {
    user: UserProfileObject;

    private usersAPI = APIConfig.usersAPI;
    private profilesAPI = APIConfig.profilesAPI;

    constructor(private auth: AuthenticationService, private http: HttpClient) {
    }

    private _profileView: string;

    get profileView(): string {
        return this._profileView;
    }

    @Input()
    set profileView(value: string) {
        this.user = null;
        this._profileView = value;
        this.getUserInfo(this._profileView);
    }

    ngOnInit() {
        //this.getUserInfo();
    }

    getUserInfo(username: string): void {
        this.auth.getCurrentSessionId().subscribe(
            (data) => {
                let httpHeaders = {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + data.getJwtToken()
                    })
                };

                this.http.get(this.profilesAPI + username, httpHeaders).subscribe(
                    (data: Array<ProfileObject>) => {
                        let profile: ProfileObject = data[0];

                        if (username === this.auth.getAuthenticatedUser().getUsername()) {
                            this.http.get(this.usersAPI + username, httpHeaders).subscribe(
                                (data: Array<UserObject>) => {
                                    let user: UserObject = data[0];
                                    let email;
                                    if (user === null) {
                                        email = null;
                                    } else {
                                        email = user.email;
                                    }

                                    this.user = {
                                        username: profile.username,
                                        firstName: profile.firstName,
                                        lastName: profile.lastName,
                                        email: email
                                    };
                                },
                                (err) => {
                                    console.log(err);
                                }
                            );
                        }
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
