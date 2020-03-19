import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from "@angular/core";
import { AuthenticationService } from "../../shared/authentication.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { APIConfig, Constants } from "../../shared/app-config";
import { NotificationService, UserSocket } from "../../shared/notification.service";
import { ChannelObject } from "../sidebar/sidebar.component";

interface UserChannelObject {
    username: string;
    channelId: string;
    userChannelRole: string;
    channelName: string;
    channelType: string;
    profileImage: string;
}

interface ProfileObject {
    username: string;
    firstName: string;
    lastName: string;
    profileImage: string;
}

interface InviteChannelObject {
    channelId: string;
    channelName: string;
    channelType: string;
    inviteStatus: string;
}

interface UserProfileObject {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    profileImage: string;
}

interface ChannelIdAndType {
    channelId: string;
    type: string;
}

export interface NotificationSocketObject {
    fromUser: UserSocket;
    toUser: UserSocket;
    notification: NotificationObject;
}

export interface NotificationObject {
    channelId: string;
    channelName: string;
    channelType: string;
    message: string;
    type: string;
    username: string;
    notificationId: string;
    insertedTime: number;
    fromFriend: string;
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
const ACCEPT_INVITE: string = " has accepted your invite to join ";
const DENY_INVITE: string = " has denied your invite to join ";
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

    userProfile: UserProfileObject;
    usersURL: string = APIConfig.usersAPI;
    notificationsURL: string = APIConfig.notificationsAPI;
    notificationCount: number = 0;
    open: boolean = false;
    @Output() notificationChannelEvent = new EventEmitter<ChannelIdAndType>();
    @Output() newChannelEvent = new EventEmitter<UserChannelObject>();
    @Output() channelEvent = new EventEmitter<ChannelObject>();
    @Output() switchEvent = new EventEmitter<string>();
    @Output() profileViewEvent = new EventEmitter<string>();
    publicInvites: Array<NotificationObject> = [];
    privateInvites: Array<NotificationObject> = [];
    friendInvites: Array<NotificationObject> = [];
    generalNotification: Array<NotificationObject> = [];
    private profilesAPI = APIConfig.profilesAPI;
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
            this.getUserInfo(this.auth.getAuthenticatedUser().getUsername());
        }
    }

    toggleOpen(): void {
        this.open = !this.open;
    }

    notificationChannelEmitter(view: string, channelId: string, type: string): void {
        this.switchEvent.emit(view);
        this.notificationChannelEvent.emit({ channelId, type });
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
            channelType: notification.type,
            profileImage: this.userProfile.profileImage
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
                            this.deleteNotification(notification)
                                .then(
                                    () => {
                                        if (notification.type == "friend") {
                                            let channel: InviteChannelObject = {
                                                channelId: notification.channelId,
                                                channelName: notification.channelName,
                                                channelType: notification.type,
                                                inviteStatus: "accepted"
                                            };

                                            this.http
                                                .put(this.channelsAPI + notification.channelId, channel, httpHeaders)
                                                .subscribe(
                                                    () => {
                                                        console.log("success");
                                                    },
                                                    (err) => {
                                                        console.log(err);
                                                    }
                                                );
                                        }
                                    }
                                )
                                .catch((err) => {
                                    console.log(err);
                                });
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

        this.sendInviteConfirmation(notification, true);
        this.removeNotification(notification);
        this.notificationChannelEmitter("chatbox", notification.channelId, notification.channelType);
    }

    sendInviteConfirmation(notification: NotificationObject, response: boolean): void {
        let message = this.auth.getAuthenticatedUser().getUsername();
        if (response) {
            message += ACCEPT_INVITE;
        } else
            message += DENY_INVITE;

        message += notification.channelName;
        let notifications: NotificationSocketObject = {
            fromUser: {
                username: this.auth.getAuthenticatedUser().getUsername(),
                id: this.notificationService.getSocketId()
            },
            toUser: this.notificationService.getOnlineUserByUsername(notification.fromFriend),
            notification: {
                channelId: notification.channelId,
                channelName: notification.channelName,
                channelType: notification.channelType,
                fromFriend: this.auth.getAuthenticatedUser().getUsername(),
                message: message,
                type: "general",
                username: notification.fromFriend,
                notificationId: null,
                insertedTime: null
            }
        };

        this.notificationService.sendNotification(notifications);
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

                this.deleteNotification(notification)
                    .then(
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
                        }
                    )
                    .catch((err) => {
                        console.log(err);
                    });
            },
            (err) => {
                console.log(err);
            }
        );
        this.sendInviteConfirmation(notification, false);
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
                                this.generalNotification = [];
                                for (let i = 0; i < data.length; i++) {
                                    if (data[i].type == PUBLIC_NOTIFICATION) {
                                        this.publicInvites.push(data[i]);
                                    } else if (data[i].type == PRIVATE_NOTIFICATION) {
                                        this.privateInvites.push(data[i]);
                                    } else if (data[i].type == FRIEND_NOTIFICATION) {
                                        this.friendInvites.push(data[i]);
                                    } else {
                                        this.generalNotification.push(data[i]);
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
        } else {
            this.generalNotification.splice(this.generalNotification.indexOf(notification), 1);
        }
        this.notificationCount--;
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
                            profileImage: profile.profileImage
                        };
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

    private deleteNotification(notification: NotificationObject): Promise<any> {
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
                        .delete(
                            this.notificationsURL +
                            notification.notificationId +
                            INSERTED_TIME_URI +
                            notification.insertedTime,
                            httpHeaders
                        )
                        .subscribe(
                            () => {
                                resolve();
                            },
                            (err) => {
                                reject(err);
                            }
                        );
                },
                (err) => {
                    console.log(err);
                }
            );
        });
    }

}
