import { Component, OnInit } from "@angular/core";
import { AuthenticationService } from "../shared/authentication.service";
import { CommonService } from "../shared/common.service";
import { FormBuilder, FormGroup } from "@angular/forms";
import { NotificationService } from "../shared/notification.service";
import { CookieService } from "ngx-cookie-service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { APIConfig } from "../shared/app-config";

const PROFILE_PAGE = "profile";
const CHANNEL_BROWSER = "channelBrowser";
const CHAT_BOX = "chatBox;";

export interface UserChannelObject {
    username: string;
    channelId: string;
    userChannelRole: string;
    channelName: string;
    channelType: string;
}

interface ChannelObject {
    channelId: string;
    channelName: string;
    channelType: string;
}

interface UserObject {
    username: string;
    email: string;
}

@Component({
    selector: "app-home",
    templateUrl: "./home.component.html",
    styleUrls: ["./home.component.scss"]
})
export class HomeComponent implements OnInit {
    userLoggedIn = false;
    options: FormGroup;

    display: string = CHANNEL_BROWSER;
    selectedChannelId: string;
    selectedChannelName: string;
    newAddedChannel: ChannelObject;
    newSubbedChannel: ChannelObject;
    profileView: string;
    usersUrl: string = APIConfig.usersAPI;
    userList: Array<UserObject> = [];
    private scrollContainer: any;

    constructor(
        private auth: AuthenticationService,
        public common: CommonService,
        fb: FormBuilder,
        private cookieService: CookieService,
        private notificationService: NotificationService,
        private http: HttpClient
    ) {
        this.userLoggedIn = auth.isLoggedIn();
        if (this.userLoggedIn) {
            this.options = fb.group({
                bottom: 0,
                fixed: false,
                top: 0
            });
            this.notificationService = NotificationService.getInstance();
            this.notificationService.getSocket(this.auth.getAuthenticatedUser().getUsername());
        }
    }

    ngOnInit(): void {
        if (this.cookieService.get("lastChannelID")) {
            this.selectedChannelId = this.cookieService.get("lastChannelID");
            this.display = "chatBox";
        } else {
            this.display = CHANNEL_BROWSER;
        }
        this.getUsers();
    }

    receiveId($event) {
        this.selectedChannelId = $event;
    }

    receiveName($event) {
        this.selectedChannelName = $event;
    }

    receiveNewSubbedChannel(event: ChannelObject) {
        this.newSubbedChannel = event;
    }

    addNewChannel($event) {
        this.newAddedChannel = $event;
    }

    updateDisplay(value: string): void {
        this.display = value;
    }

    updateProfile(value: string): void {
        this.profileView = value;
        this.updateDisplay(PROFILE_PAGE);
    }

    private getUsers(): void {
        this.auth.getCurrentSessionId().subscribe(
            (data) => {
                let httpHeaders = {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + data.getJwtToken()
                    })
                };

                this.http.get(this.usersUrl, httpHeaders).subscribe(
                    (data: Array<UserObject>) => {
                        this.userList = data;
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
