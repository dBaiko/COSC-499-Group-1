import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { NotificationService } from "../../../shared/notification.service";
import {
    APIConfig,
    Constants,
    NotificationSocketObject,
    ProfileObject,
    UserChannelObject,
    UserSocket
} from "../../../shared/app-config";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { AuthenticationService } from "../../../shared/authentication.service";
import {
    ADMIN_IDENTIFIER,
    BAN_NOTIFICATION_MESSAGE_A,
    BAN_NOTIFICATION_MESSAGE_B,
    BAN_URI,
    BANNED_IDENTIFIER,
    GENERAL_NOTIFICATION,
    UNBAN_NOTIFICATION_MESSAGE_A,
    UNBAN_URI,
    USER_URI
} from "../Chatbox_Constants";
import { CognitoIdToken } from "amazon-cognito-identity-js";

@Component({
    selector: "app-channel-user-list",
    templateUrl: "./channel-user-list.component.html",
    styleUrls: ["./channel-user-list.component.scss"]
})
export class ChannelUserListComponent implements OnInit {
    offlineUsers: Array<UserChannelObject> = [];
    onlineUsers: Array<UserChannelObject> = [];
    bannedUsers: Array<UserChannelObject> = [];
    @Output() profileViewEvent = new EventEmitter<string>();
    @Output() newBannedUserEvent = new EventEmitter<UserChannelObject>();
    @Output() newUnBannedUserEvent = new EventEmitter<UserChannelObject>();
    @Input() subscribedUsersUsernames: Array<string>;
    @Input() currentUserProfile: ProfileObject;
    private socketOnlineUsers: Array<UserSocket> = [];
    private channelsUrl: string = APIConfig.channelsAPI;

    constructor(
        private notificationService: NotificationService,
        private http: HttpClient,
        private auth: AuthenticationService
    ) {
    }

    private _newUserEvent: string;

    public get newUserEvent(): string {
        return this._newUserEvent;
    }

    @Input()
    public set newUserEvent(value: string) {
        this._newUserEvent = value;
        this.getUserList();
    }

    private _subscribedUsers: Array<UserChannelObject>;

    public get subscribedUsers(): Array<UserChannelObject> {
        return this._subscribedUsers;
    }

    @Input()
    public set subscribedUsers(value: Array<UserChannelObject>) {
        this._subscribedUsers = value;
        this.getUserList();
    }

    private _onlineUserList: Array<UserSocket>;

    public get onlineUserList(): Array<UserSocket> {
        return this._onlineUserList;
    }

    @Input()
    public set onlineUserList(value: Array<UserSocket>) {
        this._onlineUserList = value;
        this.getUserList();
    }

    ngOnInit(): void {
    }

    public goToProfile(username: string): void {
        this.profileViewEvent.emit(username);
    }

    public userIsAdmin(): boolean {
        if (this.subscribedUsers) {
            if (this.subscribedUsers.length != 0 && this.subscribedUsersUsernames.length != 0 && this.currentUserProfile) {
                if (
                    this.subscribedUsers[this.subscribedUsersUsernames.indexOf(this.currentUserProfile.username)]
                        .userChannelRole == ADMIN_IDENTIFIER
                ) {
                    return true;
                }
            }
            return false;
        }
    }

    public banUser(user: UserChannelObject): void {
        if (this.auth.isLoggedIn()) {
            this.auth.getCurrentSessionId().subscribe(
                (data: CognitoIdToken) => {
                    let httpHeaders = {
                        headers: new HttpHeaders({
                            "Content-Type": "application/json",
                            Authorization: "Bearer " + data.getJwtToken()
                        })
                    };

                    user.userChannelRole = BANNED_IDENTIFIER;

                    this.http
                        .put(this.channelsUrl + user.channelId + USER_URI + user.username + BAN_URI, {}, httpHeaders)
                        .subscribe(
                            () => {
                                if (this.onlineUsers.includes(user)) {
                                    this.onlineUsers.splice(this.onlineUsers.indexOf(user), 1);
                                } else if (this.offlineUsers.includes(user)) {
                                    this.offlineUsers.splice(this.offlineUsers.indexOf(user), 1);
                                }
                                this.bannedUsers.push(user);
                                this.sendBanNotificationToUser(user);
                                this.notificationService.sendBanUserEvent(user);
                                this.newBannedUserEvent.emit(user);
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

    public unBanUser(user: UserChannelObject): void {
        if (this.auth.isLoggedIn()) {
            this.auth.getCurrentSessionId().subscribe(
                (data: CognitoIdToken) => {
                    let httpHeaders = {
                        headers: new HttpHeaders({
                            "Content-Type": "application/json",
                            Authorization: "Bearer " + data.getJwtToken()
                        })
                    };

                    this.http
                        .put(this.channelsUrl + user.channelId + USER_URI + user.username + UNBAN_URI, {}, httpHeaders)
                        .subscribe(
                            () => {
                                this.bannedUsers.splice(this.bannedUsers.indexOf(user), 1);

                                this.socketOnlineUsers = this.notificationService.getOnlineUsers();

                                let onlineUsersNames: Array<string> = [];

                                this.socketOnlineUsers.forEach((user) => {
                                    onlineUsersNames.push(user.username);
                                });

                                if (!onlineUsersNames.includes(user.username)) {
                                    this.offlineUsers.push(user);
                                } else {
                                    this.onlineUsers.push(user);
                                }
                                this.sendUnBanNotificationToUser(user);
                                this.notificationService.sendUnbannedUserEvent(user);
                                this.newUnBannedUserEvent.emit(user);
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

    private getUserList(): void {
        if (this.subscribedUsers) {
            this.socketOnlineUsers = this.notificationService.getOnlineUsers();

            let onlineUsersNames: Array<string> = [];

            this.socketOnlineUsers.forEach((user: UserSocket) => {
                onlineUsersNames.push(user.username);
            });

            this.offlineUsers = [];
            this.onlineUsers = [];
            this.bannedUsers = [];

            for (let i = 0; i < this.subscribedUsers.length; i++) {
                let user = this.subscribedUsers[i];
                user.profileImage += Constants.QUESTION_MARK + Math.random();
                if (user.userChannelRole == BANNED_IDENTIFIER) {
                    if (this.userIsAdmin()) {
                        this.bannedUsers.push(user);
                    }
                } else if (!onlineUsersNames.includes(user.username)) {
                    this.offlineUsers.push(user);
                } else {
                    this.onlineUsers.push({
                        username: user.username,
                        channelId: user.channelId,
                        userChannelRole: user.userChannelRole,
                        channelName: user.channelName,
                        channelType: user.channelType,
                        profileImage: user.profileImage,
                        statusText: user.statusText
                    });
                }
            }
        }
    }

    private sendBanNotificationToUser(user: UserChannelObject): void {
        let message: string = BAN_NOTIFICATION_MESSAGE_A + user.channelName + BAN_NOTIFICATION_MESSAGE_B;
        let notification: NotificationSocketObject = {
            fromUser: {
                username: this.auth.getAuthenticatedUser().getUsername(),
                id: this.notificationService.getSocketId()
            },
            toUser: this.notificationService.getOnlineUserByUsername(user.username),
            notification: {
                channelId: user.channelId,
                channelName: user.channelName,
                channelType: user.channelType,
                fromFriend: this.auth.getAuthenticatedUser().getUsername(),
                message: message,
                type: GENERAL_NOTIFICATION,
                username: user.username,
                notificationId: null,
                insertedTime: null
            }
        };

        this.notificationService.sendNotification(notification);
    }

    private sendUnBanNotificationToUser(user: UserChannelObject): void {
        let message: string = UNBAN_NOTIFICATION_MESSAGE_A + user.channelName + BAN_NOTIFICATION_MESSAGE_B;
        let notification: NotificationSocketObject = {
            fromUser: {
                username: this.auth.getAuthenticatedUser().getUsername(),
                id: this.notificationService.getSocketId()
            },
            toUser: this.notificationService.getOnlineUserByUsername(user.username),
            notification: {
                channelId: user.channelId,
                channelName: user.channelName,
                channelType: user.channelType,
                fromFriend: this.auth.getAuthenticatedUser().getUsername(),
                message: message,
                type: GENERAL_NOTIFICATION,
                username: user.username,
                notificationId: null,
                insertedTime: null
            }
        };

        this.notificationService.sendNotification(notification);
    }
}
