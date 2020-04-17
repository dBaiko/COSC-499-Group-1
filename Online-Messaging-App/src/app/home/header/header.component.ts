import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { AuthenticationService } from "../../shared/authentication.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import {
    APIConfig,
    ChannelIdAndType,
    ChannelObject,
    Constants,
    InviteChannelObject,
    NotificationObject,
    NotificationSocketObject,
    ProfileObject,
    UserChannelObject
} from "../../shared/app-config";
import { NotificationService } from "../../shared/notification.service";
import { CommonService } from "../../shared/common.service";

const MY_SELECT_CHILD: string = "mySelect";
const NOTIFICATIONS_URI: string = "/notifications";
const INSERTED_TIME_URI: string = "/insertedTime/";
const PUBLIC_NOTIFICATION: string = "public";
const PRIVATE_NOTIFICATION: string = "private";
const FRIEND_NOTIFICATION: string = "friend";
const DEFAULT_CHANNEL_ROLE: string = "user";
const CHATBOX_VIEW: string = "chatbox";
const GENERAL_NOTIFICATION: string = "general";
const ACCEPTED_NOTIFICATION: string = "accepted";
const DENIED_NOTIFICATION: string = "accepted";
const ACCEPT_INVITE: string = " has accepted your invite to join ";
const DENY_INVITE: string = " has denied your invite to join ";
export const BROADCAST_NOTIFICATION_EVENT = "broadcastNotification";

@Component({
    selector: "app-header",
    templateUrl: "./header.component.html",
    styleUrls: ["./header.component.scss"]
})
export class HeaderComponent implements OnInit {
    @ViewChild(MY_SELECT_CHILD) mySelect;
    userLoggedIn = false;
    user;

    usersURL: string = APIConfig.usersAPI;
    notificationsURL: string = APIConfig.notificationsAPI;
    notificationCount: number = 0;
    open: boolean = false;
    sideBarOpen: boolean = false;
    @Output() newUserSubscriptionFromNotificationEvent = new EventEmitter<ChannelIdAndType>();
    @Output() goToChannelFromNotificationEvent = new EventEmitter<ChannelIdAndType>();
    @Input() currentUserProfile: ProfileObject = null;
    @Output() newChannelEvent = new EventEmitter<UserChannelObject>();
    @Output() channelEvent = new EventEmitter<ChannelObject>();
    @Output() switchEvent = new EventEmitter<string>();
    @Output() profileViewEvent = new EventEmitter<string>();
    @Output() sideBarToggleEvent = new EventEmitter<boolean>();
    publicInvites: Array<NotificationObject> = [];
    privateInvites: Array<NotificationObject> = [];
    friendInvites: Array<NotificationObject> = [];
    generalNotification: Array<NotificationObject> = [];
    channelBrowser = "channelBrowser";
    profile = "profile";
    settings = "settings";
    userGuide = "userGuide";
    private channelsAPI = APIConfig.channelsAPI;

    constructor(
        private _eref: ElementRef,
        public auth: AuthenticationService,
        private notificationService: NotificationService,
        private http: HttpClient,
        public common: CommonService
    ) {
        this.userLoggedIn = auth.isLoggedIn();
    }

    ngOnInit(): void {
        if (this.userLoggedIn == true) {
            this.user = this.auth.getAuthenticatedUser();

            this.getNotifications().catch((err) => {
                console.error(err);
            });
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
                    } else {
                        this.generalNotification.push(notification);
                    }
                    this.notificationCount++;
                }
            );
        }
    }

    toggleOpen($event): void {
        if ($event) {
            let target = $event.target as HTMLElement;
            if (!target.classList.contains("mat-button-wrapper") && !target.classList.contains("xbutton")) {
                this.open = !this.open;
            }
        } else {
            this.open = !this.open;
        }
    }

    newUserSubscriptionFromChannelEventEmitter(view: string, channelId: string, type: string): void {
        this.switchEvent.emit(view);
        this.newUserSubscriptionFromNotificationEvent.emit({ channelId, type });
    }

    goToChannelFromNotification(view: string, channelId: string, type: string): void {
        this.switchEvent.emit(view);
        this.goToChannelFromNotificationEvent.emit({ channelId, type });
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
            profileImage: this.currentUserProfile.profileImage,
            statusText: this.currentUserProfile.statusText
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

                // TODO: check for errors in response
                this.http
                    .post(this.channelsAPI + notification.channelId + Constants.USERS_PATH, user, httpHeaders)
                    .subscribe(
                        () => {
                            this.deleteNotification(notification)
                                .then(() => {
                                    if (notification.type == FRIEND_NOTIFICATION) {
                                        let channel: InviteChannelObject = {
                                            channelId: notification.channelId,
                                            channelName: notification.channelName,
                                            channelType: notification.type,
                                            channelDescription: null,
                                            inviteStatus: ACCEPTED_NOTIFICATION
                                        };

                                        this.http
                                            .put(
                                                this.channelsAPI +
                                                notification.channelId +
                                                Constants.SLASH +
                                                "inviteStatus" +
                                                Constants.SLASH +
                                                ACCEPTED_NOTIFICATION,
                                                channel,
                                                httpHeaders
                                            )
                                            .subscribe(
                                                () => {
                                                },
                                                (err) => {
                                                    console.log(err);
                                                }
                                            );
                                    }
                                })
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
        this.newUserSubscriptionFromChannelEventEmitter(CHATBOX_VIEW, notification.channelId, notification.channelType);
        this.notificationService.sendFriendTaglineUpdateEvent({
            username: notification.fromFriend,
            fromFriend: this.currentUserProfile.username,
            status: "accepted"
        });
    }

    sendInviteConfirmation(notification: NotificationObject, response: boolean): void {
        let message = this.auth.getAuthenticatedUser().getUsername();
        if (response) {
            message += ACCEPT_INVITE;
        } else message += DENY_INVITE;

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
                type: GENERAL_NOTIFICATION,
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
                    .then(() => {
                        let channel: InviteChannelObject = {
                            channelId: notification.channelId,
                            channelName: notification.channelName,
                            channelType: notification.type,
                            channelDescription: null,
                            inviteStatus: DENIED_NOTIFICATION
                        };

                        this.http
                            .put(
                                this.channelsAPI +
                                notification.channelId +
                                Constants.SLASH +
                                "inviteStatus" +
                                Constants.SLASH +
                                DENIED_NOTIFICATION,
                                channel,
                                httpHeaders
                            )
                            .subscribe(
                                () => {
                                    console.log("success");
                                },
                                (err) => {
                                    console.log(err);
                                }
                            );
                    })
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
        this.notificationService.sendFriendTaglineUpdateEvent({
            username: notification.fromFriend,
            fromFriend: this.currentUserProfile.username,
            status: "denied"
        });
    }

    removeNotification(notification: NotificationObject): void {
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

    deleteNotification(notification: NotificationObject): Promise<any> {
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

    toggleSideBarOpen(value: boolean) {
        if (value) {
            this.sideBarOpen = true;
            this.sideBarToggleEvent.emit(true);
        } else {
            this.sideBarOpen = false;
            this.sideBarToggleEvent.emit(false);
        }
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
                                        this.notificationCount++;
                                    } else if (data[i].type == PRIVATE_NOTIFICATION) {
                                        this.privateInvites.push(data[i]);
                                        this.notificationCount++;
                                    } else if (data[i].type == FRIEND_NOTIFICATION) {
                                        this.friendInvites.push(data[i]);
                                        this.notificationCount++;
                                    } else if (data[i].type == GENERAL_NOTIFICATION) {
                                        this.generalNotification.push(data[i]);
                                        this.notificationCount++;
                                    }
                                }
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
}
