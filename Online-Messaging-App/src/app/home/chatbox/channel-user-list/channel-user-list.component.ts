import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { NotificationService } from "../../../shared/notification.service";
import { Constants, UserChannelObject, UserSocket } from "../../../shared/app-config";

@Component({
    selector: "app-channel-user-list",
    templateUrl: "./channel-user-list.component.html",
    styleUrls: ["./channel-user-list.component.scss"]
})
export class ChannelUserListComponent implements OnInit {
    offlineUsers: Array<UserChannelObject> = [];
    onlineUsers: Array<UserChannelObject> = [];
    @Output() profileViewEvent = new EventEmitter<string>();
    private socketOnlineUsers: Array<UserSocket> = [];

    constructor(private notificationService: NotificationService) {
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

    private getUserList(): void {
        if (this.subscribedUsers) {

            this.socketOnlineUsers = this.notificationService.getOnlineUsers();

            let onlineUsersNames: Array<string> = [];

            this.socketOnlineUsers.forEach((user) => {
                onlineUsersNames.push(user.username);
            });

            this.offlineUsers = [];
            this.onlineUsers = [];

            for (let i = 0; i < this.subscribedUsers.length; i++) {
                let user = this.subscribedUsers[i];
                user.profileImage += Constants.QUESTION_MARK + Math.random();
                if (!onlineUsersNames.includes(user.username)) {
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
}
