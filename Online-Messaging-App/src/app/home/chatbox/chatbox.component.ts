import { AfterViewChecked, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { MessengerService } from "../../shared/messenger.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import {
    APIConfig,
    ChannelObject,
    Constants,
    InviteChannelObject,
    MessageObject,
    NewUsersSubbedChannelObject,
    ProfileObject,
    SettingsObject,
    UserChannelObject,
    UserObject
} from "../../shared/app-config";
import { AuthenticationService } from "../../shared/authentication.service";
import { FormControl, FormGroup, NgForm, Validators } from "@angular/forms";
import { NotificationObject, NotificationService, NotificationSocketObject } from "../../shared/notification.service";
import * as Filter from "bad-words";
import { CommonService } from "../../shared/common.service";

const whitespaceRegEx: RegExp = /^\s+$/i;
const STAR_REPLACE_REGEX: RegExp = /^\*+$/;
const STAR_REGEX: RegExp = /\*/g;
const NEW_LINE_REGEX: RegExp = /(?:\r\n|\r|\n)/g;
const BREAK_TAG: string = "<br>";
const STAR_REPLACE_VALUE: string = "\\*";
const MESSAGES_URI: string = "/messages";
const USERS_URI: string = "/users";
const NOTIFICATIONS_URI = "/notifications";
const NOTIFICATION_MESSAGE: string = "You have been invited to join ";
const MESSAGE_FORM_IDENTIFIER: string = "messageForm";
const EDIT_FORM_IDENTIFIER: string = "editForm";
const SCROLL_FRAME_IDENTIFIER: string = "scrollframe";
const HIDDEN_BUTTON_IDENTIFIER: string = "hiddenButton";
const FRIEND_IDENTIFIER: string = "friend";
const PENDING_INVITE_IDENTIFIER: string = "pending";
const DENIED_INVITE_IDENTIFIER: string = "denied";
const ACCEPTED_INVITE_IDENTIFIER: string = "accepted";

const MESSAGE_INPUT_FIELD_IDENTIFIER: string = "messageInputField";
const SCROLLABLE_IDENTIFIER: string = "scrollable";

const PENDING_INVITE_MESSAGE: string =
    " has not yet accepted your request and will not see these messages until they accept";
const DENIED_INVITE_MESSAGE: string =
    " has denied your friend request. You can continue to view the message history," +
    " but you will have to leave this channel and make a new friend request to talk to them again";
const ACCEPTED_INVITE_MESSAGE: string =
    " has left the channel. You can continue to view the message history," +
    " but you will have to leave this channel and make a new friend request to talk to them again";
const JOINED_CHANNEL_MESSAGE: string = " has joined the channel";
const LEFT_CHANNEL_MESSAGE: string = " has left the channel";

const LANG_TYPES_PREFIX: string = "<span class=\"lang-type\">";
const LANG_TYPES_SUFFIX: string = "</span><br>";
const PRE_TAG: string = "pre";

const LANG_TYPES_PREFIX_LENGTH: number = 24;
const LANG_CLASS_PREFIX_LENGTH: number = 10;
const ENTER_KEY_CODE: number = 13;
const FRIEND_CHANNEL_MAX_LENGTH = 2;
const FRIEND_CHANNEL_FIRST_USER = 0;
const FRIEND_CHANNEL_SECOND_USER = 1;

@Component({
    selector: "app-chatbox",
    templateUrl: "./chatbox.component.html",
    styleUrls: ["./chatbox.component.scss"]
})
export class ChatboxComponent implements OnInit, AfterViewChecked {
    chatMessages: Array<MessageObject> = [];
    error: string = Constants.EMPTY;
    currentlyEditing: boolean = false;
    viewed: boolean = false;

    filter = new Filter();

    @ViewChild(MESSAGE_FORM_IDENTIFIER) messageForm: NgForm;
    editForm: FormGroup;

    @ViewChild("textArea") textArea: ElementRef;

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
    @Input() settings: SettingsObject;
    @Output() profileViewEvent = new EventEmitter<string>();
    @ViewChild(SCROLL_FRAME_IDENTIFIER) scrollContainer: ElementRef;
    private channelsURL: string = APIConfig.channelsAPI;
    private messagesAPI: string = APIConfig.messagesAPI;
    private isNearBottom = false;
    private atBottom = true;
    private textAreaHeight = 0;
    private defaultHeight = 80;

    constructor(
        private messagerService: MessengerService,
        private http: HttpClient,
        private auth: AuthenticationService,
        private notificationService: NotificationService,
        public common: CommonService
    ) {
    }

    private _newUserSubbedChannel: NewUsersSubbedChannelObject;

    get newUserSubbedChannel(): NewUsersSubbedChannelObject {
        return this._newUserSubbedChannel;
    }

    @Input()
    set newUserSubbedChannel(value: NewUsersSubbedChannelObject) {
        if (value) {
            this._newUserSubbedChannel = value;
            this.sendStatus(value);
        }
    }

    private _currentUserProfile: ProfileObject;

    get currentUserProfile(): ProfileObject {
        return this._currentUserProfile;
    }

    @Input()
    set currentUserProfile(value: ProfileObject) {
        this._currentUserProfile = value;
    }

    private _currentChannel: ChannelObject;

    get currentChannel(): ChannelObject {
        return this._currentChannel;
    }

    @Input()
    set currentChannel(value: ChannelObject) {
        this._currentChannel = value;
        this.getMessages(this._currentChannel.channelId).catch((err) => {
            console.error(err);
        });
        this.isNearBottom = false;
        this.getSubcribedUsers()
            .then((data: Array<UserChannelObject>) => {
                if (this.currentChannel.channelType == FRIEND_IDENTIFIER) {
                    let notFound = true;
                    for (let i in data) {
                        if (data[i].username == this.parseFriendChannelName(this.currentChannel.channelName)) {
                            notFound = false;
                        }
                    }
                    if (notFound) {
                        this.getChannelInfo().then((data: InviteChannelObject) => {
                            let inviteStatus: string = data.inviteStatus;
                            let friendName: string = (this.friendMessage = this.parseFriendChannelName(
                                this.currentChannel.channelName
                            ));
                            if (inviteStatus == PENDING_INVITE_IDENTIFIER) {
                                this.friendMessage = friendName + PENDING_INVITE_MESSAGE;
                            } else if (inviteStatus == DENIED_INVITE_IDENTIFIER) {
                                this.friendMessage = friendName + DENIED_INVITE_MESSAGE;
                            } else if (inviteStatus == ACCEPTED_INVITE_IDENTIFIER) {
                                this.friendMessage = friendName + ACCEPTED_INVITE_MESSAGE;
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
        this.getChannelNotifications().catch((err) => {
            console.error(err);
        });
    }

    ngOnInit(): void {
        this.editForm = new FormGroup({
            content: new FormControl(Constants.EMPTY, Validators.compose([Validators.required]))
        });
        this.messagerService.subscribeToSocket().subscribe((data) => {
            if (data) {
                if (data.channelId == this.currentChannel.channelId) {
                    if (!this.settings.explicit) {
                        data.content = this.filterClean(data.content);
                    }
                    this.chatMessages.push(data);
                    setTimeout(this.addLangTypes, 50);
                }
            }
        });
        this.textAreaHeight = document.getElementById(MESSAGE_INPUT_FIELD_IDENTIFIER).getBoundingClientRect().height;
    }

    ngAfterViewChecked() {
        this.scrollToBottom();
        if (!this.viewed) {
            this.addLangTypes();
        }
    }

    getMessages(channelId: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.auth.getCurrentSessionId().subscribe(
                (data) => {
                    let httpHeaders = {
                        headers: new HttpHeaders({
                            "Content-Type": "application/json",
                            Authorization: "Bearer " + data.getJwtToken()
                        })
                    };

                    this.http.get(this.channelsURL + channelId + MESSAGES_URI, httpHeaders).subscribe(
                        (data: Array<MessageObject>) => {
                            if (!this.settings.explicit) {
                                for (let i = 0; i < data.length; i++) {
                                    data[i].content = this.filterClean(data[i].content);
                                }
                            }
                            this.chatMessages = data || [];
                            resolve();
                        },
                        (err) => {
                            this.error = err.toString();
                            reject();
                        }
                    );
                },
                (err) => {
                    console.log(err);
                    reject();
                }
            );
        });
    }

    sendMessage(form: FormGroup): void {
        let value = form.value;
        if (value.content && !whitespaceRegEx.test(value.content)) {
            form.reset();
            let chatMessage = {
                channelId: this.currentChannel.channelId,
                username: this.auth.getAuthenticatedUser().getUsername(),
                content: value.content.replace(NEW_LINE_REGEX, "\n"),
                profileImage: this.currentUserProfile.profileImage
            };
            this.isNearBottom = false;
            this.messagerService.sendMessage(chatMessage);
        } // TODO: add user error message if this is false
    }

    goToProfile(username: string) {
        this.profileViewEvent.emit(username);
    }

    closeInviting(): void {
        this.inviting = false;
    }

    openInviting(): void {
        this.inviteSearchList = [];
        this.inviting = true;
        this.getChannelNotifications().catch((err) => {
            console.error(err);
        });
        this.getSubcribedUsers().catch((err) => {
            console.error(err);
        });
    }

    inviteFormSubmit() {
        if (!this.common.inviteFormSearch(this.inviteSearch, this.inviteSearchList, this.userList)) {
            this.inviteSearchList = [];
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
                channelType: this.currentChannel.channelType,
                fromFriend: this.auth.getAuthenticatedUser().getUsername(),
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
        let users = channelName.split(Constants.DASH, FRIEND_CHANNEL_MAX_LENGTH);
        if (users[FRIEND_CHANNEL_FIRST_USER] == this.auth.getAuthenticatedUser().getUsername()) {
            return users[FRIEND_CHANNEL_SECOND_USER];
        } else {
            return users[FRIEND_CHANNEL_FIRST_USER];
        }
    }

    onScroll(): void {
        let element = this.scrollContainer.nativeElement;
        // using ceiling and floor here to normalize the differences in browsers way of calculating these values
        this.atBottom = Math.ceil(element.scrollHeight - element.scrollTop) === Math.floor(element.offsetHeight);
        this.isNearBottom = !this.atBottom;
    }

    textAreaSubmit(event) {
        if (event.keyCode == 13 && event.shiftKey) {
        } else if (event.keyCode == 13) {
            event.preventDefault();
            this.messageForm.ngSubmit.emit();
        }
        if (
            document.getElementById(MESSAGE_INPUT_FIELD_IDENTIFIER).getBoundingClientRect().height > this.textAreaHeight
        ) {
            this.defaultHeight = this.defaultHeight - 2;
            document.getElementById(SCROLLABLE_IDENTIFIER).style.height = this.defaultHeight + Constants.PERCENT;
            this.textAreaHeight = document
                .getElementById(MESSAGE_INPUT_FIELD_IDENTIFIER)
                .getBoundingClientRect().height;
        } else if (
            document.getElementById(MESSAGE_INPUT_FIELD_IDENTIFIER).getBoundingClientRect().height < this.textAreaHeight
        ) {
            this.defaultHeight = this.defaultHeight + 2;
            document.getElementById(SCROLLABLE_IDENTIFIER).style.height = this.defaultHeight + Constants.PERCENT;
            this.textAreaHeight = document
                .getElementById(MESSAGE_INPUT_FIELD_IDENTIFIER)
                .getBoundingClientRect().height;
        }
    }

    editFormTextAreaSubmit(event) {
        if (event.keyCode == ENTER_KEY_CODE && event.shiftKey) {
        } else if (event.keyCode == ENTER_KEY_CODE) {
            event.preventDefault();
            document.getElementById(HIDDEN_BUTTON_IDENTIFIER).click();
        }
    }

    editFormSubmit(form: FormGroup, message: MessageObject) {
        if (form.value.content && !whitespaceRegEx.test(form.value.content)) {
            this.editMessage(message, form.value.content);
        }
    }

    filterClean(value: string) {
        let s: string = this.filter.clean(value);
        if (STAR_REPLACE_REGEX.test(s.trim())) {
            return s.replace(STAR_REGEX, STAR_REPLACE_VALUE);
        }
        return s;
    }

    deleteMessage(chatMessage: MessageObject) {
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
                        this.messagesAPI +
                        chatMessage.messageId +
                        Constants.SLASH +
                        chatMessage.channelId +
                        Constants.SLASH +
                        chatMessage.insertTime +
                        Constants.SLASH +
                        chatMessage.username,
                        httpHeaders
                    )
                    .subscribe(
                        () => {
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
        this.chatMessages[this.chatMessages.indexOf(chatMessage)].deleted = true;
    }

    toggleEditingMessage(chatMessage: MessageObject) {
        if (!this.currentlyEditing) {
            this.currentlyEditing = true;
            this.chatMessages[this.chatMessages.indexOf(chatMessage)].editing = true;
            this.editForm.get("content").setValue(chatMessage.content);
        }
    }

    editMessage(message: MessageObject, newContent: string) {
        this.auth.getCurrentSessionId().subscribe(
            (data) => {
                let httpHeaders = {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + data.getJwtToken()
                    })
                };

                message.content = newContent;

                this.http.put(this.messagesAPI + message.messageId, message, httpHeaders).subscribe(
                    () => {
                        this.currentlyEditing = false;
                        this.chatMessages[this.chatMessages.indexOf(message)].editing = false;
                        this.editForm.get("content").setValue(Constants.EMPTY);
                        this.chatMessages[this.chatMessages.indexOf(message)].content = newContent;
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

    private sendStatus(newUsersSubbedChannel: NewUsersSubbedChannelObject): void {
        if (newUsersSubbedChannel.joined) {
            let chatMessage = {
                channelId: newUsersSubbedChannel.channelId,
                username: null,
                content: newUsersSubbedChannel.username + JOINED_CHANNEL_MESSAGE,
                profileImage: null
            };
            this.isNearBottom = false;
            this.messagerService.sendMessage(chatMessage);
        } else {
            let chatMessage = {
                channelId: newUsersSubbedChannel.channelId,
                username: null,
                content: newUsersSubbedChannel.username + LEFT_CHANNEL_MESSAGE,
                profileImage: null
            };
            this.isNearBottom = false;
            this.messagerService.sendMessage(chatMessage);
        }
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

    private getChannelInfo(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.auth.getCurrentSessionId().subscribe(
                (data) => {
                    let httpHeaders = {
                        headers: new HttpHeaders({
                            "Content-Type": "application/json",
                            Authorization: "Bearer " + data.getJwtToken()
                        })
                    };

                    this.http.get(this.channelsURL + this.currentChannel.channelId, httpHeaders).subscribe(
                        (data: InviteChannelObject) => {
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

    private addLangTypes(): void {
        let messages = document.getElementsByTagName(PRE_TAG);
        // @ts-ignore
        for (let item: HTMLBodyElement of messages) {
            this.viewed = true;
            if (item.innerHTML.substring(0, LANG_TYPES_PREFIX_LENGTH) != LANG_TYPES_PREFIX) {
                item.innerHTML =
                    LANG_TYPES_PREFIX +
                    item.className.substring(LANG_CLASS_PREFIX_LENGTH) +
                    LANG_TYPES_SUFFIX +
                    item.innerHTML;
            }
        }
    }
}
