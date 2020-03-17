import {AfterViewChecked, AfterViewInit, Component, Input, OnInit} from '@angular/core';
import {NotificationService, UserSocket} from "../../../shared/notification.service";
import {UserChannelObject} from "../../home.component";

@Component({
    selector: 'app-channel-user-list',
    templateUrl: './channel-user-list.component.html',
    styleUrls: ['./channel-user-list.component.scss']
})
export class ChannelUserListComponent implements OnInit {
    private onlineUsers: Array<UserSocket> = [];
    private _subscribedUsers: Array<UserChannelObject>;

    constructor(private notificationService: NotificationService) {
    }

    get subscribedUsers(): Array<UserChannelObject> {
        return this._subscribedUsers;
    }

    @Input()
    set subscribedUsers(value: Array<UserChannelObject>) {
        this._subscribedUsers = value;
        this.onlineUsers=this.notificationService.getOnlineUsers();
        console.log(this.onlineUsers);
        console.log(this._subscribedUsers);
    }

    ngOnInit(): void {

    }
}
