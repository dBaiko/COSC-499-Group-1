import { Component, ElementRef, EventEmitter, HostListener, OnInit, Output, ViewChild } from "@angular/core";
import { AuthenticationService } from "../../shared/authentication.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { APIConfig, Constants } from "../../shared/app-config";
import { NotificationObject, NotificationService, NotificationSocketObject } from "../../shared/notification.service";
import { ChannelObject } from "../sidebar/sidebar.component";

interface UserChannelObject {
    username: string;
    channelId: string;
    userChannelRole: string;
    channelName: string;
    channelType: string;
}

interface InviteChannelObject {
    channelId: string;
    channelName: string;
    channelType: string;
    inviteStatus: string;
}

const MY_SELECT_CHILD: string = "mySelect";
const MAT_SELECT_ARROW: string = "mat-select-arrow";
const CLASS_DROPPED: string = "dropped";
const NOTIFICATIONS_URI: string = "/notifications";
const INSERTED_TIME_URI: string = "/insertedTime/";
const PUBLIC_NOTIFICATION: string = "public";
const PRIVATE_NOTIFICATION: string = "private";
const FRIEND_NOTIFICATION: string = "friend";
const DEFAULT_CHANNEL_ROLE: string = "user";
export const BROADCAST_NOTIFICATION_EVENT = "broadcastNotification";

@Component({
    selector: "app-header",
    templateUrl: "./header.component.html",
    styleUrls: ["./header.component.scss"]
})
export class HeaderComponent implements OnInit {
    @ViewChild(MY_SELECT_CHILD, { static: false }) mySelect;
    userLoggedIn = false;
    user;

    usersURL: string = APIConfig.usersAPI;
    notificationsURL: string = APIConfig.notificationsAPI;
    notificationCount: number = 0;

    open: boolean = false;
    @Output() newChannelEvent = new EventEmitter<UserChannelObject>();
    @Output() channelEvent = new EventEmitter<ChannelObject>();
    @Output() switchEvent = new EventEmitter<string>();
    @Output() profileViewEvent = new EventEmitter<string>();
    publicInvites: Array<NotificationObject> = [];
    privateInvites: Array<NotificationObject> = [];
    friendInvites: Array<NotificationObject> = [];
    private channelsAPI = APIConfig.channelsAPI;
    private channelBrowser = "channelBrowser";
    private profile = "profile";
    private settings = "settings";

    constructor(
        private _eref: ElementRef,
        private auth: AuthenticationService,
        private notificationService: NotificationService,
        private http: HttpClient
    ) {
        this.userLoggedIn = auth.isLoggedIn();
    }


    ngOnInit(): void {
        if (this.userLoggedIn == true) {
            this.user = this.auth.getAuthenticatedUser();

            this.getNotifications();
            this.notificationService.addSocketListener(
                BROADCAST_NOTIFICATION_EVENT,
                (notificationSocketObject: NotificationSocketObject) => {
                    let notification: NotificationObject = notificationSocketObject.notification;
                    if (notification.type == PUBLIC_NOTIFICATION) {
                        this.publicInvites.push(notification);
                    } else if (notification.type == PRIVATE_NOTIFICATION) {
                        this.privateInvites.push(notification);
                    } else if (notification.type == FRIEND_NOTIFICATION) {
                        this.friendInvites.push(notification);
                    }
                    this.notificationCount++;
                }
            );
        }
    }

    toggleOpen(): void {
        this.open = !this.open;
    }

    switchDisplay(value: string): void {
        this.switchEvent.emit(value);

        if (value === this.profile) {
            this.profileViewEvent.emit(this.auth.getAuthenticatedUser().getUsername());
        }
    }

    acceptInvite(notification: NotificationObject): void {
        let user: UserChannelObject = {
            username: this.auth.getAuthenticatedUser().getUsername(),
            channelId: notification.channelId,
            userChannelRole: DEFAULT_CHANNEL_ROLE,
            channelName: notification.channelName,
            channelType: notification.type
        };

        this.newChannelEvent.emit(user);

        this.auth.getCurrentSessionId().subscribe(
            (data) => {
                let httpHeaders = {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + data.getJwtToken()
                    })
                };

                // TODO: check for errors in responce
                this.http
                    .post(this.channelsAPI + notification.channelId + Constants.USERS_PATH, user, httpHeaders)
                    .subscribe(
                        () => {
                            this.http
                                .delete(
                                    this.notificationsURL +
                                    notification.notificationId +
                                    INSERTED_TIME_URI +
                                    notification.insertedTime,
                                    httpHeaders
                                )
                                .subscribe(
                                    () => {
                                        if (notification.type == "friend") {

                                            let channel: InviteChannelObject = {
                                                channelId: notification.channelId,
                                                channelName: notification.channelName,
                                                channelType: notification.type,
                                                inviteStatus: "accepted"
                                            };

                                            this.http.put(this.channelsAPI + notification.channelId, channel, httpHeaders).subscribe(
                                                () => {
                                                    console.log("success");
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
            },
            (err) => {
                console.log(err);
            }
        );
        this.removeNotification(notification);
    }

    denyInvite(notification: NotificationObject): void {
        this.auth.getCurrentSessionId().subscribe(
            (data) => {
                let httpHeaders = {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + data.getJwtToken()
                    })
                };

                this.http
                    .delete(
                        this.notificationsURL +
                        notification.notificationId +
                        INSERTED_TIME_URI +
                        notification.insertedTime,
                        httpHeaders
                    )
                    .subscribe(
                        () => {

                            let channel: InviteChannelObject = {
                                channelId: notification.channelId,
                                channelName: notification.channelName,
                                channelType: notification.type,
                                inviteStatus: "denied"
                            };

                            this.http.put(this.channelsAPI + notification.channelId, channel, httpHeaders).subscribe(
                                () => {
                                    console.log("success");
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
            },
            (err) => {
                console.log(err);
            }
        );
        this.removeNotification(notification);
    }

    private getNotifications(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
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
                            this.usersURL + this.auth.getAuthenticatedUser().getUsername() + NOTIFICATIONS_URI,
                            httpHeaders
                        )
                        .subscribe(
                            (data: Array<NotificationObject>) => {
                                this.publicInvites = [];
                                this.privateInvites = [];
                                this.friendInvites = [];
                                for (let i = 0; i < data.length; i++) {
                                    if (data[i].type == PUBLIC_NOTIFICATION) {
                                        this.publicInvites.push(data[i]);
                                    } else if (data[i].type == PRIVATE_NOTIFICATION) {
                                        this.privateInvites.push(data[i]);
                                    } else if (data[i].type == FRIEND_NOTIFICATION) {
                                        this.friendInvites.push(data[i]);
                                    }
                                }

                                this.notificationCount = data.length;
                            },
                            (err) => {
                                console.log(err);
                            }
                        );
                },
                (err) => {
                    reject(err);
                }
            );
        });
    }

    private removeNotification(notification: NotificationObject): void {
        if (notification.type == PUBLIC_NOTIFICATION) {
            this.publicInvites.splice(this.publicInvites.indexOf(notification), 1);
        } else if (notification.type == PRIVATE_NOTIFICATION) {
            this.privateInvites.splice(this.privateInvites.indexOf(notification), 1);
        } else if (notification.type == FRIEND_NOTIFICATION) {
            this.friendInvites.splice(this.friendInvites.indexOf(notification), 1);
        }
        this.notificationCount--;
    }
}
