import { Component, Input, OnInit } from "@angular/core";
import { NotificationService, UserSocket } from "../../../shared/notification.service";
import { UserChannelObject } from "../../home.component";

@Component({
    selector: "app-channel-user-list",
    templateUrl: "./channel-user-list.component.html",
    styleUrls: ["./channel-user-list.component.scss"]
})
export class ChannelUserListComponent implements OnInit {

    offlineUsers: Array<UserChannelObject> = [];

    private onlineUsers: Array<UserSocket> = [];

    constructor(private notificationService: NotificationService) {
    }

    private _subscribedUsers: Array<UserChannelObject>;

    get subscribedUsers(): Array<UserChannelObject> {
        return this._subscribedUsers;
    }

    @Input()
    set subscribedUsers(value: Array<UserChannelObject>) {
        this._subscribedUsers = value;
        this.onlineUsers = this.notificationService.getOnlineUsers();

        let onlineUsersNames: Array<string> = [];

        this.onlineUsers.forEach((user) => {
            onlineUsersNames.push(user.username);
        });

        for (let i = 0; i < this.subscribedUsers.length; i++) {
            let user = this.subscribedUsers[i];
            if (!onlineUsersNames.includes(user.username)) {
                this.offlineUsers.push(user);
            }
        }
    }

    ngOnInit(): void {

    }
}
