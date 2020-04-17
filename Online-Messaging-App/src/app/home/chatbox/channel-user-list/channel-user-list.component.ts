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

    get newUserEvent(): string {
        return this._newUserEvent;
    }

    @Input()
    set newUserEvent(value: string) {
        this._newUserEvent = value;
        this.getUserList();
    }

    private _subscribedUsers: Array<UserChannelObject>;

    get subscribedUsers(): Array<UserChannelObject> {
        return this._subscribedUsers;
    }

    @Input()
    set subscribedUsers(value: Array<UserChannelObject>) {
        this._subscribedUsers = value;
        this.getUserList();
    }

    private _onlineUserList: Array<UserSocket>;

    get onlineUserList(): Array<UserSocket> {
        return this.onlineUserList;
    }

    @Input()
    set onlineUserList(value: Array<UserSocket>) {
        this._onlineUserList = value;
        this.getUserList();
    }

    ngOnInit(): void {
    }

    goToProfile(username: string) {
        this.profileViewEvent.emit(username);
    }

    userIsAdmin(): boolean {
        if (this.subscribedUsers.length != 0 && this.subscribedUsersUsernames.length != 0 && this.currentUserProfile) {
            if (
                this.subscribedUsers[this.subscribedUsersUsernames.indexOf(this.currentUserProfile.username)]
                    .userChannelRole == "admin"
            ) {
                return true;
            }
        }
        return false;
    }

    banUser(user: UserChannelObject) {
        this.auth.getCurrentSessionId().subscribe(
            (data) => {
                let httpHeaders = {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + data.getJwtToken()
                    })
                };

                user.userChannelRole = "banned";

                this.http
                    .put(this.channelsUrl + user.channelId + "/users/" + user.username + "/ban", {}, httpHeaders)
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
                            console.log(err);
                        }
                    );
            },
            (err) => {
                console.log(err);
            }
        );
    }

    unBanUser(user: UserChannelObject) {
        this.auth.getCurrentSessionId().subscribe(
            (data) => {
                let httpHeaders = {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + data.getJwtToken()
                    })
                };

                this.http
                    .put(this.channelsUrl + user.channelId + "/users/" + user.username + "/unban", {}, httpHeaders)
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
                            console.log(err);
                        }
                    );
            },
            (err) => {
                console.log(err);
            }
        );
    }

    private getUserList(): void {
        if (this.subscribedUsers) {
            this.socketOnlineUsers = this.notificationService.getOnlineUsers();

            let onlineUsersNames: Array<string> = [];

            this.socketOnlineUsers.forEach((user) => {
                onlineUsersNames.push(user.username);
            });

            this.offlineUsers = [];
            this.onlineUsers = [];
            this.bannedUsers = [];

            for (let i = 0; i < this.subscribedUsers.length; i++) {
                let user = this.subscribedUsers[i];
                user.profileImage += Constants.QUESTION_MARK + Math.random();
                if (user.userChannelRole == "banned") {
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

    private sendBanNotificationToUser(user: UserChannelObject) {
        let message: string = "You have been banned from the channel " + user.channelName + " by the admin.";
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
                type: "general",
                username: user.username,
                notificationId: null,
                insertedTime: null
            }
        };

        this.notificationService.sendNotification(notification);
    }

    private sendUnBanNotificationToUser(user: UserChannelObject) {
        let message: string = "You have been unbanned from the channel " + user.channelName + " by the admin.";
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
                type: "general",
                username: user.username,
                notificationId: null,
                insertedTime: null
            }
        };

        this.notificationService.sendNotification(notification);
    }
}
