import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { NotificationService, UserSocket } from "../../../shared/notification.service";
import { UserChannelObject } from "../../home.component";

@Component({
    selector: "app-channel-user-list",
    templateUrl: "./channel-user-list.component.html",
    styleUrls: ["./channel-user-list.component.scss"]
})
export class ChannelUserListComponent implements OnInit {

    offlineUsers: Array<UserChannelObject> = [];
    onlineUsers = [];
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
        this.socketOnlineUsers = this.notificationService.getOnlineUsers();

        let onlineUsersNames: Array<string> = [];

        this.socketOnlineUsers.forEach((user) => {
            onlineUsersNames.push(user.username);
        });

        this.offlineUsers = [];
        this.onlineUsers = [];

        for (let i = 0; i < this.subscribedUsers.length; i++) {
            let user = this.subscribedUsers[i];
            user.profileImage += "?" + Math.random();
            if (!onlineUsersNames.includes(user.username)) {
                this.offlineUsers.push(user);
            } else {
                this.onlineUsers.push({
                    username: user.username,
                    profileImage: user.profileImage
                });
            }
        }

    }

    ngOnInit(): void {
    }

    goToProfile(username: string) {
        this.profileViewEvent.emit(username);
    }

}
