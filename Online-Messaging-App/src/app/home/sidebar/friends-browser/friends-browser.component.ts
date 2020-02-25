import {Component, Input, OnInit} from '@angular/core';
import {APIConfig, Constants} from "../../../shared/app-config";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import { AuthenticationService } from "../../../shared/authentication.service";
import {NotificationObject, NotificationService, NotificationSocketObject} from "../../../shared/notification.service";

interface UserObject {
   username: string;
   email: string;
}

interface UserChannelObject {
    username: string;
    channelId: string;
    channelName: string;
    channelType: string;
    userChannelRole: string;
}


const NOTIFICATIONS_URI = "/notifications";

@Component({
  selector: 'app-friends-browser',
  templateUrl: './friends-browser.component.html',
  styleUrls: ['./friends-browser.component.scss']
})
export class FriendsBrowserComponent implements OnInit {
    friends: Array<UserObject> = [];
    inviteSearchList: Array<UserObject> = [];
    userNotification: Array<NotificationObject> = [];
    channelNotificationsUsernames: Array<string> = [];
    friendList: string[] = [];
    search: string = Constants.EMPTY;
    searching: boolean = false;
    private usersURL: string = APIConfig.usersAPI;
    @Input() userList: Array<UserObject>;


  constructor(private auth: AuthenticationService, private http: HttpClient, private notificationService: NotificationService) { }

  ngOnInit() {
  }

    onKey($event: Event) {
        //set search value as whatever is entered on search bar every keystroke
        this.search = ($event.target as HTMLInputElement).value;
        this.searching = true;
        this.sendQuery();
    }
    sendQuery() {
        if (this.search==Constants.EMPTY) {
            this.inviteSearchList = [];
        }
        else {
            for (let i in this.userList) {
                if (this.searchStrings(this.userList[i].username.toLowerCase(), this.search.toLowerCase())) {
                    if (this.inviteSearchList.indexOf(this.userList[i]) === -1) {
                        this.inviteSearchList.push(this.userList[i]);
                    }
                } else {
                    if (this.inviteSearchList[this.inviteSearchList.indexOf(this.userList[i])]) {
                        this.inviteSearchList.splice(this.inviteSearchList.indexOf(this.userList[i]), 1);
                    }
                }
            }
        }
    }

    sendInvite(username: string): void {
        let notification: NotificationSocketObject = {
            fromUser: {
                username: this.auth.getAuthenticatedUser().getUsername(),
                id: this.notificationService.getSocketId()
            },
            toUser: this.notificationService.getOnlineUserByUsername(username),
            notification: {
                channelId: this.currentChannel.channelId,
                channelName: this.currentChannel.channelName,
                message: NOTIFICATION_MESSAGE + this.currentChannel.channelName,
                type: this.currentChannel.channelType,
                username: username,
                notificationId: null,
                insertedTime: null
            }
        };

        this.notificationService.sendNotification(notification);
        this.channelNotificationsUsernames.push(username);
    }

    private getChannelNotifications(): Promise<any> {
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
                        .get(this.usersURL + this.auth.getAuthenticatedUser().getUsername() + NOTIFICATIONS_URI, httpHeaders)
                        .subscribe(
                            (data: Array<NotificationObject>) => {
                                this.userNotification = data;
                                let usernames: Array<string> = [];
                                for (let i in data) {
                                    usernames.push(data[i].username);
                                }
                                this.channelNotificationsUsernames = usernames;
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

    private searchStrings(match: string, search: string): boolean {
        if (search === match) {
            return true;
        }
        if (search.length > match.length) {
            return false;
        }
        if (match.substring(0, search.length) == search) {
            return true;
        }
        return false;
    }



}
