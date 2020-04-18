import { Component, OnInit, ViewChild } from "@angular/core";
import { AuthenticationService } from "../shared/authentication.service";
import { CommonService } from "../shared/common.service";
import { FormBuilder, FormGroup } from "@angular/forms";
import { NotificationService } from "../shared/notification.service";
import { CookieService } from "ngx-cookie-service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import {
    APIConfig,
    ChannelIdAndType,
    ChannelObject,
    Constants,
    NewUsersSubbedChannelObject,
    ProfileObject,
    SettingsObject,
    UserChannelObject,
    UserObject,
    UserSocket
} from "../shared/app-config";
import { ColorScheme, DarkThemeColors, LightThemeColors } from "../app.component";
import { BreakpointObserver, BreakpointState } from "@angular/cdk/layout";

const PROFILE_PAGE = "profile";
const CHANNEL_BROWSER = "channelBrowser";
const CHAT_BOX = "chatBox";
const DARK = "dark";
const LIGHT = "light";

const USER_LIST_EVENT = "userList";
const SETTINGS_URI = "/settings";
const PROFILES_API = APIConfig.profilesAPI;
const USERS_API = APIConfig.usersAPI;
const SIDENAV_IDENTIFIER = "sidenav";
const KICK_EVENT = "kickEvent";
const UNBAN_EVENT = "unBanEvent";
const BREAK_POINT_OBSERVER_KEY = "(max-width: 450px)";

@Component({
    selector: "app-home",
    templateUrl: "./home.component.html",
    styleUrls: ["./home.component.scss"]
})
export class HomeComponent implements OnInit {
    userLoggedIn = false;
    options: FormGroup;

    display: string = CHANNEL_BROWSER;
    selectedChannelId: ChannelObject;
    newAddedChannel: ChannelObject;
    newSubbedChannel: ChannelObject;
    newUserSubscribedChannelFromNotification: ChannelIdAndType;
    channelToGoToFromNotification: ChannelIdAndType;
    profileView: string;
    usersUrl: string = APIConfig.usersAPI;
    userList: Array<UserObject> = [];
    settings: SettingsObject;
    value: boolean = false;
    onlineUserList: Array<UserSocket> = [];

    newBannedUser: UserChannelObject;

    sidebarOpened: boolean = true;

    @ViewChild(SIDENAV_IDENTIFIER) sidebar;

    public currentUserProfile: ProfileObject;
    public newUserSubbedChannel: NewUsersSubbedChannelObject;

    constructor(
        private auth: AuthenticationService,
        public common: CommonService,
        public fb: FormBuilder,
        private cookieService: CookieService,
        private notificationService: NotificationService,
        private http: HttpClient,
        public breakpointObserver: BreakpointObserver
    ) {
    }

    public ngOnInit(): void {
        this.userLoggedIn = this.auth.isLoggedIn();
        if (this.userLoggedIn) {
            this.options = this.fb.group({
                bottom: 0,
                fixed: false,
                top: 0
            });
            this.notificationService = NotificationService.getInstance();
            this.notificationService.getSocket(this.auth.getAuthenticatedUser().getUsername());
            this.notificationService.addSocketListener(USER_LIST_EVENT, (userList: Array<UserSocket>) => {
                this.notificationService.setOnlineUsers(userList);
                this.onlineUserList = userList;
            });
        }

        if (this.auth.isLoggedIn()) {
            let user: string = this.auth.getAuthenticatedUser().getUsername();
            if (this.cookieService.get(user)) {
                this.selectedChannelId = JSON.parse(this.cookieService.get(user)).lastChannelID;
                this.display = CHAT_BOX;
            } else {
                this.display = CHANNEL_BROWSER;
            }
            this.getUsers();
            this.getSettings();
            this.getUserInfo().catch((err) => {
                console.error(err);
            });

            this.notificationService.addSocketListener(KICK_EVENT, (user: UserChannelObject) => {
                this.handleNewBannedUserEvent(user);
            });

            this.notificationService.addSocketListener(UNBAN_EVENT, (user: UserChannelObject) => {
                this.handleNewUnBannedUserEvent(user);
            });
        }
        this.breakpointObserver.observe([BREAK_POINT_OBSERVER_KEY]).subscribe((state: BreakpointState) => {
            if (state.matches) {
                this.value = false;
                this.sidebarOpened = false;
            } else {
                this.value = true;
                this.sidebarOpened = true;
            }
        });
    }

    public receiveId($event: ChannelObject): void {
        this.selectedChannelId = $event;
    }

    public receiveNewSubbedChannel(event): void {
        this.newSubbedChannel = event;
    }

    public addNewChannel($event: ChannelObject): void {
        this.newAddedChannel = $event;
    }

    public updateDisplay(value: string): void {
        this.display = value;
    }

    public handleNewUserSubscriptionFromChannel(channel: ChannelIdAndType): void {
        this.newUserSubscribedChannelFromNotification = channel;
    }

    public handleGoToChannelFromNotification(channel: ChannelIdAndType): void {
        this.channelToGoToFromNotification = channel;
    }

    public updateProfile(value: string): void {
        this.profileView = value;
        this.updateDisplay(PROFILE_PAGE);
    }

    public getUpdatedProfile(): void {
        this.getUserInfo().then(() => {
            this.currentUserProfile.profileImage += Constants.QUESTION_MARK + Math.random();
        });
    }

    public changeTheme(themeString: string): void {
        this.settings.theme = themeString;
        if (themeString == LIGHT) {
            this.setTheme(LightThemeColors);
        } else if (themeString == DARK) {
            this.setTheme(DarkThemeColors);
        }
    }

    public setExplicit(explicit: boolean): void {
        this.settings.explicit = explicit;
    }

    public setNewUserSubbedChannel($event: NewUsersSubbedChannelObject) {
        this.newUserSubbedChannel = $event;
    }

    public toggleSidebarOpen(): void {
        this.sidebar.toggle();
    }

    public handleNewBannedUserEvent(user: UserChannelObject): void {
        if (this.display == CHAT_BOX && this.selectedChannelId.channelId == user.channelId) {
            this.updateDisplay(CHANNEL_BROWSER);
        }
        this.newBannedUser = user;
    }

    public handleNewUnBannedUserEvent(user: UserChannelObject): void {
        this.newBannedUser = user;
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
                        console.error(err);
                    }
                );
            },
            (err) => {
                console.error(err);
            }
        );
    }

    private getSettings(): void {
        this.auth.getCurrentSessionId().subscribe(
            (data) => {
                let httpHeaders = {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + data.getJwtToken()
                    })
                };

                this.http
                    .get(this.usersUrl + this.auth.getAuthenticatedUser().getUsername() + SETTINGS_URI, httpHeaders)
                    .subscribe(
                        (data: SettingsObject) => {
                            this.settings = data[0];
                            this.changeTheme(data[0].theme);
                        },
                        (err) => {
                            console.error(err);
                        }
                    );
            },
            (err) => {
                console.error(err);
            }
        );
    }

    private getUserInfo(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.auth.getCurrentSessionId().subscribe(
                (data) => {
                    let httpHeaders = {
                        headers: new HttpHeaders({
                            "Content-Type": "application/json",
                            Authorization: "Bearer " + data.getJwtToken()
                        })
                    };

                    let username = this.auth.getAuthenticatedUser().getUsername();

                    this.http.get(PROFILES_API + username, httpHeaders).subscribe(
                        (data: Array<ProfileObject>) => {
                            let profile: ProfileObject = data[0];
                            this.currentUserProfile = {
                                username: profile.username,
                                firstName: profile.firstName,
                                lastName: profile.lastName,
                                profileImage: profile.profileImage + Constants.QUESTION_MARK + Math.random(),
                                statusText: profile.statusText
                            };

                            this.http.get(USERS_API + username, httpHeaders).subscribe((data: Array<UserObject>) => {
                                this.currentUserProfile.email = data[0].email;
                                resolve();
                            });
                        },
                        (err) => {
                            console.error(err);
                            reject(err);
                        }
                    );
                },
                (err) => {
                    console.error(err);
                    reject(err);
                }
            );
        });
    }

    private setTheme(theme: ColorScheme): void {
        document.documentElement.style.setProperty("--primary-color", theme["primary-color"]);
        document.documentElement.style.setProperty("--secondary-color", theme["secondary-color"]);
        document.documentElement.style.setProperty("--tertiary-color", theme["tertiary-color"]);
        document.documentElement.style.setProperty("--primary-text-color", theme["primary-text-color"]);
        document.documentElement.style.setProperty("--soft-black", theme["soft-black"]);
        document.documentElement.style.setProperty("--background-color", theme["background-color"]);
        document.documentElement.style.setProperty("--element-color", theme["element-color"]);
        document.documentElement.style.setProperty("--hover-color", theme["hover-color"]);
        document.documentElement.style.setProperty("--element-hover-color", theme["element-hover-color"]);
        document.documentElement.style.setProperty("--line-colour", theme["line-colour"]);
    }
}
