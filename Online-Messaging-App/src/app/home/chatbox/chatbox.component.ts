import { AfterViewChecked, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { MessengerService } from "../../shared/messenger.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { APIConfig, Constants } from "../../shared/app-config";
import { AuthenticationService } from "../../shared/authentication.service";
import { FormGroup } from "@angular/forms";
import { NotificationObject, NotificationService, NotificationSocketObject } from "../../shared/notification.service";
import { ChannelObject } from "../sidebar/sidebar.component";

const whitespaceRegEx: RegExp = /^\s+$/i;
const MESSAGES_URI = "/messages";
const USERS_URI = "/users";
const NOTIFICATIONS_URI = "/notifications";
const NOTIFICATION_MESSAGE = "You have been invited to join ";

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

@Component({
    selector: "app-chatbox",
    templateUrl: "./chatbox.component.html",
    styleUrls: ["./chatbox.component.scss"]
})
export class ChatboxComponent implements OnInit, AfterViewChecked {
    chatMessages;
    error: string = Constants.EMPTY;

    inviting: boolean = false;
    inviteSearch: string = Constants.EMPTY;

    inviteSearchList: Array<UserObject> = [];

    subscribedUsers: Array<UserChannelObject> = [];
    subscribedUsersUsernames: Array<string> = [];

    channelNotifications: Array<NotificationObject> = [];
    channelNotificationsUsernames: Array<string> = [];

    friendMessage: string = null;

    @Input() channelName: string;
    @Input() userList: Array<UserObject>;
    @Output() profileViewEvent = new EventEmitter<string>();
    @ViewChild("scrollframe", { static: false }) scrollContainer: ElementRef;
    private channelsURL: string = APIConfig.channelsAPI;
    private isNearBottom = false;
    private atBottom = true;

    constructor(
        private messagerService: MessengerService,
        private http: HttpClient,
        private auth: AuthenticationService,
        private notificationService: NotificationService
    ) {
    }

    private _currentChannel: ChannelObject;

    get currentChannel(): ChannelObject {
        return this._currentChannel;
    }

    @Input()
    set currentChannel(value: ChannelObject) {
        this._currentChannel = value;
        this.getMessages(this._currentChannel.channelId);
        this.isNearBottom = false;
        this.getSubcribedUsers()
            .then((data: Array<UserChannelObject>) => {
                if (this.currentChannel.channelType == "friend") {
                    let notFound = true;
                    for (let i in data) {
                        if (data[i].username == this.parseFriendChannelName(this.currentChannel.channelName)) {
                            notFound = false;
                        }
                    }
                    if (notFound) {
                        this.getChannelNotifications().then((data: Array<NotificationObject>) => {
                            let inviteSent = false;
                            for (let i = 0; i < data.length; i++) {
                                if (data[i].username == this.parseFriendChannelName(this.currentChannel.channelName)) {
                                    inviteSent = true;
                                }
                            }
                            if (inviteSent) {
                                this.friendMessage =
                                    this.parseFriendChannelName(this.currentChannel.channelName) +
                                    " has not yet accepted your request and will not see these messages until they accept";
                            } else {
                                this.friendMessage =
                                    this.parseFriendChannelName(this.currentChannel.channelName) +
                                    " has left the channel";
                            }
                        });
                    } else {
                        this.friendMessage = null;
                    }
                } else {
                    this.friendMessage = null;
                }
            })
            .catch((err) => {
                console.log(err);
            });
        this.getChannelNotifications();
    }

    ngOnInit(): void {
        this.messagerService.subscribeToSocket().subscribe((data) => {
            if (data.channelId == this.currentChannel.channelId) {
                this.chatMessages.push(data);
            }
        });
    }

    ngAfterViewChecked() {
        this.scrollToBottom();
    }

    getMessages(channelId: string): void {
        this.auth.getCurrentSessionId().subscribe(
            (data) => {
                let httpHeaders = {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + data.getJwtToken()
                    })
                };

                this.http.get(this.channelsURL + channelId + MESSAGES_URI, httpHeaders).subscribe(
                    (data) => {
                        this.chatMessages = data || [];
                    },
                    (err) => {
                        this.error = err.toString();
                    }
                );
            },
            (err) => {
                console.log(err);
            }
        );
    }

    sendMessage(form: FormGroup): void {
        let value = form.value;
        if (value.content && !whitespaceRegEx.test(value.content)) {
            form.reset();
            let chatMessage = {
                channelId: this.currentChannel.channelId,
                username: this.auth.getAuthenticatedUser().getUsername(),
                content: value.content
            };
            this.isNearBottom = false;
            this.messagerService.sendMessage(chatMessage);
        } // TODO: add user error message if this is false
    }

    goToProfile(username: string) {
        this.profileViewEvent.emit(username);
    }

    toggleInviting(): void {
        this.inviteSearchList = [];
        if (this.inviting) {
            this.inviting = false;
        } else {
            this.inviting = true;
            this.getChannelNotifications();
            this.getSubcribedUsers();
        }
    }

    inviteFormSubmit() {
        if (this.inviteSearch == Constants.EMPTY) {
            this.inviteSearchList = [];
        } else {
            for (let i in this.userList) {
                if (this.searchStrings(this.userList[i].username.toLowerCase(), this.inviteSearch.toLowerCase())) {
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

    onKey($event: Event) {
        //set search value as whatever is entered on search bar every keystroke
        this.inviteSearch = ($event.target as HTMLInputElement).value;
        this.inviteFormSubmit();
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
                fromFriend: null,
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

    parseFriendChannelName(channelName: string): string {
        let users = channelName.split("-", 2);
        if (users[0] == this.auth.getAuthenticatedUser().getUsername()) return users[1];
        else return users[0];
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

    private getSubcribedUsers(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.auth.getCurrentSessionId().subscribe(
                (data) => {
                    let httpHeaders = {
                        headers: new HttpHeaders({
                            "Content-Type": "application/json",
                            Authorization: "Bearer " + data.getJwtToken()
                        })
                    };

                    this.http.get(this.channelsURL + this.currentChannel.channelId + USERS_URI, httpHeaders).subscribe(
                        (data: Array<UserChannelObject>) => {
                            this.subscribedUsers = data;
                            let usernames: Array<string> = [];
                            for (let i in data) {
                                usernames.push(data[i].username);
                            }
                            this.subscribedUsersUsernames = usernames;
                            resolve(data);
                        },
                        (err) => {
                            console.log(err);
                            reject(err);
                        }
                    );
                },
                (err) => {
                    console.log(err);
                    reject(err);
                }
            );
        });
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
                        .get(this.channelsURL + this.currentChannel.channelId + NOTIFICATIONS_URI, httpHeaders)
                        .subscribe(
                            (data: Array<NotificationObject>) => {
                                this.channelNotifications = data;
                                let usernames: Array<string> = [];
                                for (let i in data) {
                                    usernames.push(data[i].username);
                                }
                                this.channelNotificationsUsernames = usernames;
                                resolve(data);
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

    private onScroll(): void {
        let element = this.scrollContainer.nativeElement;
        // using ceiling and floor here to normalize the differences in browsers way of calculating these values
        this.atBottom = Math.ceil(element.scrollHeight - element.scrollTop) === Math.floor(element.offsetHeight);
        if (this.atBottom) {
            this.isNearBottom = false;
        } else {
            this.isNearBottom = true;
        }
    }

    private scrollToBottom(): void {
        if (this.isNearBottom) {
            return;
        }
        try {
            this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
            this.isNearBottom = false;
        } catch (err) {
            console.log(err);
        }
    }
}
