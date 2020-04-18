import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import {
    APIConfig,
    ChannelAndFirstUser,
    ChannelObject,
    Constants,
    HttpResponse,
    NotificationObject,
    NotificationSocketObject,
    ProfileObject,
    UserObject,
    UserProfileObject
} from "../../../shared/app-config";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { AuthenticationService } from "../../../shared/authentication.service";
import { NotificationService } from "../../../shared/notification.service";
import { CommonService } from "../../../shared/common.service";

const NOTIFICATIONS_URI: string = "/fromFriend/";
const INPUT_FORM_IDENTIFIER: string = "inputForm";
const NOTIFICATION_MESSAGE: string = " is requesting to direct message you!";
const FRIEND: string = "friend";
const PENDING: string = "pending";

@Component({
    selector: "app-friends-browser",
    templateUrl: "./friends-browser.component.html",
    styleUrls: ["./friends-browser.component.scss"]
})
export class FriendsBrowserComponent implements OnInit {
    inviteSearchList: Array<UserObject> = [];
    friendNotifications: Array<NotificationObject>;
    friendNotificationUsernames: Array<string>;
    search: string = Constants.EMPTY;
    searching: boolean = false;
    @Input() userList: Array<UserObject>;
    @Input() friendList: Array<ChannelObject> = [];
    @Output() newFriendChannelEvent = new EventEmitter();
    @ViewChild(INPUT_FORM_IDENTIFIER) inputForm: ElementRef;
    userProfile: UserProfileObject;
    private notificationsURL: string = APIConfig.notificationsAPI;
    private channelsURL: string = APIConfig.channelsAPI;
    private profilesAPI = APIConfig.profilesAPI;

    constructor(
        public auth: AuthenticationService,
        private http: HttpClient,
        private notificationService: NotificationService,
        private common: CommonService
    ) {
    }

    ngOnInit() {
        this.getFriendNotifications().catch((err) => {
            console.error(err);
        });
    }

    onKey($event: Event): void {
        this.search = this.common.sanitizeText(($event.target as HTMLInputElement).value);
        this.searching = true;
        this.sendQuery();
        this.getUserInfo(this.auth.getAuthenticatedUser().getUsername());
    }

    sendQuery(): void {
        if (!this.common.inviteFormSearch(this.search, this.inviteSearchList, this.userList)) {
            this.inviteSearchList = [];
            this.getFriendNotifications().catch((err) => {
                console.error(err);
            });
        }
    }

    findFriendChannel(username: string): boolean {
        for (let i in this.friendList) {
            let users = this.friendList[i].channelName.split(Constants.DASH, 2);
            if (users.includes(username)) return true;
        }
        return false;
    }

    sendInvite(username: string): void {
        this.searching = false;
        this.search = Constants.EMPTY;
        this.inputForm.nativeElement.value = Constants.EMPTY;
        let newChannel: ChannelAndFirstUser = {
            channelName: this.auth.getAuthenticatedUser().getUsername() + Constants.DASH + username,
            channelType: FRIEND,
            channelDescription: null,
            firstUsername: this.auth.getAuthenticatedUser().getUsername(),
            firstUserChannelRole: FRIEND,
            inviteStatus: PENDING,
            profileImage: this.userProfile.profileImage
        };

        this.auth.getCurrentSessionId().subscribe(
            (data) => {
                let httpHeaders = {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + data.getJwtToken()
                    })
                };

                this.http.post(this.channelsURL, newChannel, httpHeaders).subscribe(
                    (data: HttpResponse) => {
                        let notification: NotificationSocketObject = {
                            fromUser: {
                                username: this.auth.getAuthenticatedUser().getUsername(),
                                id: this.notificationService.getSocketId()
                            },
                            toUser: this.notificationService.getOnlineUserByUsername(username),
                            notification: {
                                channelId: data.data.newChannel.channelId,
                                channelName: data.data.newChannel.channelName,
                                channelType: data.data.newChannel.channelType,
                                fromFriend: this.auth.getAuthenticatedUser().getUsername(),
                                message: this.auth.getAuthenticatedUser().getUsername() + NOTIFICATION_MESSAGE,
                                type: FRIEND,
                                username: username,
                                notificationId: null,
                                insertedTime: null
                            }
                        };

                        this.newFriendChannelEvent.emit({
                            channelId: data.data.newChannel.channelId,
                            channelName: data.data.newChannel.channelName,
                            channelType: FRIEND
                        });

                        this.notificationService.sendNotification(notification);
                        this.friendNotificationUsernames.push(username);
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

    private getFriendNotifications(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.auth.getCurrentSessionId().subscribe(
                (data) => {
                    let httpHeaders = {
                        headers: new HttpHeaders({
                            "Content-Type": "application/json",
                            Authorization: "Bearer " + data.getJwtToken()
                        })
                    };

                    this.http
                        .get(
                            this.notificationsURL + NOTIFICATIONS_URI + this.auth.getAuthenticatedUser().getUsername(),
                            httpHeaders
                        )
                        .subscribe(
                            (data: Array<NotificationObject>) => {
                                this.friendNotifications = data;
                                let usernames: Array<string> = [];
                                for (let i in data) {
                                    if (data[i].type == FRIEND) {
                                        usernames.push(data[i].username);
                                    }
                                }
                                this.friendNotificationUsernames = usernames;
                                resolve();
                            },
                            (err) => {
                                reject(err);
                            }
                        );
                },
                (err) => {
                    reject(err);
                }
            );
        });
    }

    private getUserInfo(username: string): void {
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
                        this.userProfile = {
                            username: profile.username,
                            firstName: profile.firstName,
                            lastName: profile.lastName,
                            email: null,
                            profileImage: profile.profileImage,
                            statusText: profile.statusText
                        };
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
}
