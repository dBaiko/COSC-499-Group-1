import { AfterViewChecked, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { MessengerService } from "../../shared/messenger.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import {
    APIConfig,
    ChannelObject,
    Constants,
    EmojiList,
    FriendTaglineUpdateEventObject,
    InviteChannelObject,
    MessageObject,
    NewUsersSubbedChannelObject,
    NotificationObject,
    NotificationSocketObject,
    ProfileObject,
    ReactionObject,
    ReactionSocketObject,
    SettingsObject,
    UserChannelObject,
    UserObject
} from "../../shared/app-config";
import { AuthenticationService } from "../../shared/authentication.service";
import { FormControl, FormGroup, NgForm, Validators } from "@angular/forms";
import * as Filter from "bad-words";
import { CommonService } from "../../shared/common.service";
import { NotificationService } from "../../shared/notification.service";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { MarkupTutorialComponent } from "./markup-tutorial/markup-tutorial.component";
import { BreakpointObserver, BreakpointState } from "@angular/cdk/layout";
import { CognitoIdToken } from "amazon-cognito-identity-js";
import {
    ACCEPTED_INVITE_IDENTIFIER,
    ACCEPTED_INVITE_MESSAGE,
    ADMIN_BAN_MESSAGE,
    ADMIN_IDENTIFIER,
    ADMIN_REMOVE_MESSAGE,
    ADMIN_REMOVE_MESSAGE_A,
    ADMIN_REMOVE_MESSAGE_B,
    ADMIN_TRUE_VALUE,
    ADMIN_USERNAME_URI,
    ARROW_DOWN,
    ARROW_UP,
    AT_IDENTIFIER,
    BACKDROP_ID,
    BACKGROUND_DARKER_CLASS,
    BAN_BROADCAST_EVENT,
    BANNED_IDENTIFIER,
    BREAKPOINT_OBSERVER_KEY,
    BROADCAST_REACTION_ADD_EVENT,
    BROADCAST_REACTION_REMOVE_EVENT,
    CHANNEL_DESC_IDENTIFIER,
    CHANNEL_MESSAGE,
    CHECK_REGEX,
    CHECK_TEXT,
    CONTENT_OPENED_CLASS,
    DEFAULT_USER_CHANNEL_ROLE,
    DENIED_INVITE_IDENTIFIER,
    DENIED_INVITE_MESSAGE,
    DIALOG_CLASS,
    DIALOG_HEIGHT,
    DIRECT_MESSAGES_MESSAGE,
    DOUBLE_NEWLINE,
    ENTER_KEY,
    FRIEND,
    FRIEND_CHANNEL_FIRST_USER,
    FRIEND_CHANNEL_MAX_LENGTH,
    FRIEND_CHANNEL_SECOND_USER,
    FRIEND_CHANNEL_TYPE,
    FRIEND_IDENTIFIER,
    FRIEND_TAGLINE_UPDATE_ACCEPTED,
    FRIEND_TAGLINE_UPDATE_DENIED,
    FRIEND_TAGLINE_UPDATE_EVENT,
    GENERAL_NOTIFICATION,
    HIDDEN_BUTTON_IDENTIFIER,
    HIGHLIGHTS_CLASS,
    INFO_IDENTIFIER,
    JOINED_CHANNEL_MESSAGE,
    LANG_CLASS_PREFIX_LENGTH,
    LANG_TYPES_PREFIX,
    LANG_TYPES_PREFIX_LENGTH,
    LANG_TYPES_SUFFIX,
    LEFT_CHANNEL_MESSAGE,
    MARK_REGEX,
    MARK_TEXT_PREFIX,
    MARK_TEXT_SUFFIX,
    MARKUP_LENGTH,
    MENTION_EVERYONE_IDENTIFIER,
    MENTION_REGEX,
    MESSAGE_CONTENT_IDENTIFIER,
    MESSAGE_FORM_IDENTIFIER,
    MESSAGE_INPUT_FIELD_IDENTIFIER,
    MESSAGE_INPUT_ID,
    MESSAGES_URI,
    NEW_LINE_REGEX,
    NEWLINE,
    NEWLINE_REGEX,
    NOTIFICATION_MESSAGE,
    NOTIFICATIONS_URI,
    PENDING_INVITE_IDENTIFIER,
    PENDING_INVITE_MESSAGE,
    PRE_TAG,
    PRIVATE,
    PUBLIC,
    REACTIONS_URI,
    SCROLL_FRAME_IDENTIFIER,
    SCROLL_UP_PEEK_PREVIEW_AMOUNT,
    SCROLLABLE_IDENTIFIER,
    SHIFT_KEY,
    SIDEBAR_CLOSED_CLASS,
    SIDEBAR_IDENTIFIER,
    SPACE_KEY,
    STAR_REGEX,
    STAR_REPLACE_REGEX,
    STAR_REPLACE_VALUE,
    TEXT_AREA_IDENTIFIER,
    TRUE_VALUE,
    TWO_KEY,
    USER_LEFT_CHANNEL_EVENT,
    USER_SUBBED_CHANNEL_EVENT,
    USERS_URI,
    whitespaceRegEx
} from "./Chatbox_Constants";

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

    emojiMessage: boolean = false;
    emojiList = EmojiList;
    filter = new Filter();
    @ViewChild(MESSAGE_FORM_IDENTIFIER) messageForm: NgForm;
    mentioning: boolean = false;
    mentionList: Array<string> = [];
    mentioningIndex: number = 0;
    mentionListToSubmit: Array<string> = [];
    selectedMentionIndex: number = -1;
    selectingFromMention: boolean = false;

    markupTutorialOpen: boolean = false;

    editForm: FormGroup;
    channelDescForm: FormGroup;

    @ViewChild(TEXT_AREA_IDENTIFIER) textArea: ElementRef;
    sidebarOpened: boolean = true;
    inviting: boolean = false;
    editingChannelDescription: boolean = false;
    inviteSearch: string = Constants.EMPTY;
    inviteSearchList: Array<UserObject> = [];
    subscribedUsers: Array<UserChannelObject> = [];
    subscribedUsersUsernames: Array<string> = [];
    usersWithoutBanned: Array<string> = [];
    channelNotifications: Array<NotificationObject> = [];
    channelNotificationsUsernames: Array<string> = [];
    friendMessage: string = null;
    newUserEvent: string = Constants.EMPTY;
    @Input() channelName: string;
    @Input() userList: Array<UserObject>;
    @Input() settings: SettingsObject;
    @Input() onlineUserList: Array<UserObject>;
    @Output() profileViewEvent = new EventEmitter<string>();
    @ViewChild(SCROLL_FRAME_IDENTIFIER) scrollContainer: ElementRef;
    toggleEmoji = false;
    friendsProfileImage: string;
    private channelsURL: string = APIConfig.channelsAPI;
    private messagesAPI: string = APIConfig.messagesAPI;
    private profilesAPI: string = APIConfig.profilesAPI;
    private isNearBottom = false;
    private atBottom = true;
    private textAreaHeight = 0;
    private defaultHeight = 80;
    private loadCount = 0;

    private messageToScrollTo: MessageObject;

    constructor(
        private messagerService: MessengerService,
        private http: HttpClient,
        private auth: AuthenticationService,
        private dialog: MatDialog,
        private notificationService: NotificationService,
        public common: CommonService,
        public breakpointObserver: BreakpointObserver
    ) {
    }

    private _newUserSubbedChannel: NewUsersSubbedChannelObject;

    public get newUserSubbedChannel(): NewUsersSubbedChannelObject {
        return this._newUserSubbedChannel;
    }

    @Input()
    public set newUserSubbedChannel(value: NewUsersSubbedChannelObject) {
        if (value) {
            this._newUserSubbedChannel = value;
            this.sendStatus(value);
            this.newUserEvent = value.username;
            this.notificationService.sendNewUserJoinedChannelEvent(value);
            this.subscribedUsers.push({
                username: value.username,
                channelId: value.channelId,
                channelName: this.currentChannel.channelId,
                channelType: this.currentChannel.channelType,
                userChannelRole: DEFAULT_USER_CHANNEL_ROLE
            });
        }
    }

    private _currentUserProfile: ProfileObject;

    public get currentUserProfile(): ProfileObject {
        return this._currentUserProfile;
    }

    @Input()
    public set currentUserProfile(value: ProfileObject) {
        this._currentUserProfile = value;
    }

    private _currentChannel: ChannelObject;

    public get currentChannel(): ChannelObject {
        return this._currentChannel;
    }

    @Input()
    public set currentChannel(value: ChannelObject) {
        if (value) {
            this._currentChannel = value;
            this.getChannelInfo().catch((err) => {
                console.error(err);
            });
            this.getMessages(this._currentChannel.channelId)
                .then(() => {
                    for (let message of this.chatMessages) {
                        this.getReactionsForMessage(message.messageId).then((data: Array<ReactionObject>) => {
                            message.reactions = data;
                        });
                    }
                })
                .catch((err) => {
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

                        let friendsUsername = this.parseFriendChannelName(this.currentChannel.channelName);
                        this.getFriendsProfilePicture(friendsUsername);
                    } else {
                        this.friendMessage = null;
                    }
                })
                .catch((err) => {
                    console.error(err);
                });
            this.getChannelNotifications().catch((err) => {
                console.error(err);
            });
        }
    }

    public ngOnInit(): void {
        this.editForm = new FormGroup({
            content: new FormControl(Constants.EMPTY, Validators.compose([Validators.required]))
        });
        this.channelDescForm = new FormGroup({
            channelDescription: new FormControl(Constants.EMPTY, Validators.compose([Validators.required]))
        });
        this.messagerService.subscribeToSocket().subscribe((data) => {
            if (data) {
                if (data.channelId == this.currentChannel.channelId) {
                    if (!this.settings.explicit) {
                        data.content = this.filterClean(data.content);
                    }
                    data.reactions = [];
                    this.chatMessages.push(data);
                    setTimeout(this.addLangTypes, 50);
                }
            }
        });
        this.textAreaHeight = document.getElementById(MESSAGE_INPUT_FIELD_IDENTIFIER).getBoundingClientRect().height;

        this.notificationService.addSocketListener(BROADCAST_REACTION_ADD_EVENT, (reaction: ReactionSocketObject) => {
            let messageIndex: number = -1;
            for (let i = 0; i < this.chatMessages.length; i++) {
                if (this.chatMessages[i].messageId == reaction.messageId) {
                    messageIndex = i;
                    break;
                }
            }
            if (messageIndex != -1) {
                let reactionIndex = -1;
                for (let i = 0; i < this.chatMessages[messageIndex].reactions.length; i++) {
                    if (this.chatMessages[messageIndex].reactions[i].emoji == reaction.emoji) {
                        reactionIndex = i;
                        break;
                    }
                }

                if (reactionIndex != -1) {
                    if (
                        !this.chatMessages[messageIndex].reactions[reactionIndex].username.includes(reaction.username)
                    ) {
                        this.chatMessages[messageIndex].reactions[reactionIndex].username.push(reaction.username);
                        this.chatMessages[messageIndex].reactions[reactionIndex].count++;
                    }
                } else {
                    this.chatMessages[messageIndex].reactions.push({
                        emoji: reaction.emoji,
                        count: 1,
                        username: [reaction.username]
                    });
                }
            }
        });

        this.notificationService.addSocketListener(
            BROADCAST_REACTION_REMOVE_EVENT,
            (reaction: ReactionSocketObject) => {
                for (let i = 0; i < this.chatMessages.length; i++) {
                    if (this.chatMessages[i].messageId == reaction.messageId) {
                        for (let j = 0; j < this.chatMessages[i].reactions.length; j++) {
                            if (this.chatMessages[i].reactions[j].emoji == reaction.emoji) {
                                this.chatMessages[i].reactions[j].username.splice(
                                    this.chatMessages[i].reactions[j].username.indexOf(reaction.username),
                                    1
                                );
                                this.chatMessages[i].reactions[j].count--;

                                if (this.chatMessages[i].reactions[j].count == 0) {
                                    this.chatMessages[i].reactions.splice(j, 1);
                                }

                                break;
                            }
                        }

                        break;
                    }
                }
            }
        );

        this.notificationService.addSocketListener(BAN_BROADCAST_EVENT, () => {
            this.getSubcribedUsers().catch((err) => {
                console.error(err);
            });
        });

        this.notificationService.addSocketListener(USER_SUBBED_CHANNEL_EVENT, (user: NewUsersSubbedChannelObject) => {
            if (user.channelId == this.currentChannel.channelId) {
                this.getSubcribedUsers().catch((err) => {
                    console.error(err);
                });
            }
        });

        this.notificationService.addSocketListener(USER_LEFT_CHANNEL_EVENT, (user: NewUsersSubbedChannelObject) => {
            if (user.channelId == this.currentChannel.channelId) {
                this.getSubcribedUsers().catch((err) => {
                    console.error(err);
                });
            }
        });

        this.notificationService.addSocketListener(
            FRIEND_TAGLINE_UPDATE_EVENT,
            (user: FriendTaglineUpdateEventObject) => {
                if (user.status == FRIEND_TAGLINE_UPDATE_ACCEPTED) {
                    this.friendMessage = null;
                } else if (user.status == FRIEND_TAGLINE_UPDATE_DENIED) {
                    this.friendMessage = user.fromFriend + DENIED_INVITE_MESSAGE;
                }
            }
        );

        this.breakpointObserver.observe([BREAKPOINT_OBSERVER_KEY]).subscribe((state: BreakpointState) => {
            if (state.matches) {
                this.toggleSideBarOpen(false);
            } else {
                this.toggleSideBarOpen(true);
            }
        });
    }

    public ngAfterViewChecked() {
        this.scrollToBottom();
        if (!this.viewed) {
            this.addLangTypes();
        }
    }

    public getMessages(channelId: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.auth.getCurrentSessionId().subscribe(
                (data) => {
                    let httpHeaders = {
                        headers: new HttpHeaders({
                            "Content-Type": "application/json",
                            Authorization: "Bearer " + data.getJwtToken()
                        })
                    };

                    this.http.get(this.channelsURL + channelId + MESSAGES_URI + 0, httpHeaders).subscribe(
                        (data: Array<MessageObject>) => {
                            this.loadCount = 0;
                            if (!this.settings.explicit) {
                                for (let i = 0; i < data.length; i++) {
                                    data[i].content = this.filterClean(data[i].content);
                                }
                            }

                            this.chatMessages = data || [];
                            this.loadCount = data.length;
                            resolve();
                        },
                        (err) => {
                            this.error = err.toString();
                            reject();
                        }
                    );
                },
                (err) => {
                    console.error(err);
                    reject();
                }
            );
        });
    }

    public sendMessage(form: FormGroup): void {
        let value = form.value;
        if (value.content && !whitespaceRegEx.test(value.content)) {
            form.reset();
            this.handleInput();
            value.content = this.common.sanitizeText(value.content);
            value.content = this.markUpMentions(value.content);
            if (this.mentionListToSubmit.includes(MENTION_EVERYONE_IDENTIFIER)) {
                for (let user of this.mentionList) {
                    if (user != MENTION_EVERYONE_IDENTIFIER) {
                        this.sendMentionNotification(user);
                    }
                }
            } else {
                for (let user of this.mentionListToSubmit) {
                    this.sendMentionNotification(user);
                }
            }

            this.mentionListToSubmit = [];
            let chatMessage = {
                channelId: this.currentChannel.channelId,
                channelType: this.currentChannel.channelType,
                username: this.auth.getAuthenticatedUser().getUsername(),
                content: value.content.replace(NEW_LINE_REGEX, NEWLINE),
                profileImage: this.currentUserProfile.profileImage
            };
            this.isNearBottom = false;
            this.messagerService.sendMessage(chatMessage);
        }
    }

    public goToProfile(username: string): void {
        this.profileViewEvent.emit(username);
    }

    public closeInviting(): void {
        this.inviting = false;
    }

    public openInviting(): void {
        this.inviteSearchList = [];
        this.inviting = true;
        this.getChannelNotifications().catch((err) => {
            console.error(err);
        });
        this.getSubcribedUsers().catch((err) => {
            console.error(err);
        });
    }

    public inviteFormSubmit(): void {
        if (!this.common.inviteFormSearch(this.inviteSearch, this.inviteSearchList, this.userList)) {
            this.inviteSearchList = [];
        }
    }

    public onKey($event: Event): void {
        this.inviteSearch = this.common.sanitizeText(($event.target as HTMLInputElement).value);
        this.inviteFormSubmit();
    }

    public sendInvite(username: string): void {
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

    public parseFriendChannelName(channelName: string): string {
        let users = channelName.split(Constants.DASH, FRIEND_CHANNEL_MAX_LENGTH);
        if (users[FRIEND_CHANNEL_FIRST_USER] == this.auth.getAuthenticatedUser().getUsername()) {
            return users[FRIEND_CHANNEL_SECOND_USER];
        } else {
            return users[FRIEND_CHANNEL_FIRST_USER];
        }
    }

    public onScroll(): void {
        let element = this.scrollContainer.nativeElement;
        // using ceiling and floor here to normalize the differences in browsers way of calculating these values
        this.atBottom = Math.ceil(element.scrollHeight - element.scrollTop) === Math.floor(element.offsetHeight);
        this.isNearBottom = !this.atBottom;

        if (element.scrollTop == 0) {
            this.messageToScrollTo = this.chatMessages[0];
            this.getMoreMessages();
        }
    }

    public textAreaSubmit(event): void {
        if (event.keyCode == ENTER_KEY && event.shiftKey) {
        } else if (event.keyCode == ENTER_KEY && !this.selectingFromMention) {
            event.preventDefault();
            this.resetMentionList();
            this.messageForm.ngSubmit.emit();
            return;
        } else if (event.keyCode == ARROW_UP) {
            event.preventDefault();
        }

        this.checkForTextAreaHeight();
    }

    public handleMentioning(event): void {
        let text = this.messageForm.form.value.content as string;
        if (text) {
            if (this.selectingFromMention) {
                if (event.keyCode == ARROW_UP || event.keyCode == ARROW_DOWN) {
                    event.preventDefault();
                    if (event.keyCode == ARROW_UP) {
                        this.selectedMentionIndex--;
                    } else if (event.keyCode == ARROW_DOWN) {
                        this.selectedMentionIndex++;
                    }
                    if (this.selectedMentionIndex < 0) {
                        this.selectedMentionIndex = 0;
                    } else if (this.selectedMentionIndex > this.mentionList.length) {
                        this.selectedMentionIndex = -1;
                        this.selectingFromMention = false;
                    }
                } else if (event.keyCode == ENTER_KEY) {
                    let userToMention = this.mentionList[this.selectedMentionIndex];
                    this.messageForm.setValue({
                        content:
                            text.substring(0, text.lastIndexOf(AT_IDENTIFIER) + 1) + userToMention + Constants.SPACE
                    });
                    this.addMentionIfMentionable(userToMention);
                    this.resetMentionList();
                } else {
                    this.selectedMentionIndex = -1;
                    this.selectingFromMention = false;
                }
            } else if (this.mentioning) {
                if (event.keyCode == SPACE_KEY) {
                    let userToMention = text.substring(this.mentioningIndex, text.lastIndexOf(Constants.SPACE));
                    this.addMentionIfMentionable(userToMention);
                    this.resetMentionList();
                } else if (event.keyCode == ARROW_UP) {
                    event.preventDefault();
                    this.selectingFromMention = true;
                    this.selectedMentionIndex = this.mentionList.length - 1;
                } else if (event.keyCode == SHIFT_KEY) {
                    event.preventDefault();
                } else {
                    let partialUsername = text.substring(this.mentioningIndex);
                    this.mentionListSearch(partialUsername);
                }
            } else {
                if (event.keyCode == TWO_KEY) {
                    this.mentioning = true;
                    this.mentioningIndex = text.length;
                }
            }
        } else {
            this.resetMentionList();
        }

        if (this.mentionList.length == 0) {
            this.mentioning = false;
        }

        this.handleInput();
    }

    public clickMentionList(username: string): void {
        let text = this.messageForm.form.value.content as string;
        this.messageForm.setValue({
            content: text.substring(0, text.lastIndexOf(AT_IDENTIFIER) + 1) + username + Constants.SPACE
        });
        this.addMentionIfMentionable(username);
        this.resetMentionList();
    }

    public handleInput(): void {
        let text = this.messageForm.form.value.content as string;
        text = this.common.sanitizeText(text);
        document.getElementsByClassName(HIGHLIGHTS_CLASS)[0].innerHTML = this.applyHighlights(text);
    }

    public applyHighlights(text: string): string {
        if (text) {
            text = text.replace(NEWLINE_REGEX, DOUBLE_NEWLINE);
            let atUsernameRegExp = MENTION_REGEX;
            let result;
            let indexs = [];
            while ((result = atUsernameRegExp.exec(text))) {
                if (!MARK_REGEX.test(text.substring(result.index - MARKUP_LENGTH, result.index))) {
                    let endIndex = text.substring(result.index).indexOf(Constants.SPACE);
                    if (endIndex == -1) {
                        endIndex = text.length;
                    }
                    endIndex = result.index + endIndex;

                    let user = text.substring(result.index, endIndex);
                    if (this.mentionList.includes(user.substring(1))) {
                        indexs.push({
                            begin: result.index,
                            end: endIndex,
                            user: user
                        });
                    }
                }
            }
            let retText = Constants.EMPTY;
            if (indexs.length > 0) {
                retText = text.substring(0, indexs[0].begin);
                for (let i = 0; i < indexs.length; i++) {
                    retText += MARK_TEXT_PREFIX;
                    retText += indexs[i].user;
                    retText += MARK_TEXT_SUFFIX;
                    if (i != indexs.length - 1) {
                        retText += text.substring(indexs[i].end, indexs[i + 1].begin);
                    }
                }
                return retText;
            }

            return text;
        } else return null;
    }

    public handleScroll(): void {
        document.getElementById(BACKDROP_ID).scrollTop = document.getElementById(MESSAGE_INPUT_ID).scrollTop;
    }

    public editFormTextAreaSubmit(event): void {
        if (event.keyCode == ENTER_KEY && event.shiftKey) {
        } else if (event.keyCode == ENTER_KEY) {
            event.preventDefault();
            document.getElementById(HIDDEN_BUTTON_IDENTIFIER).click();
        }
    }

    public editFormSubmit(form: FormGroup, message: MessageObject): void {
        if (form.value.content && !whitespaceRegEx.test(form.value.content)) {
            this.editMessage(message, form.value.content);
        }
    }

    public filterClean(value: string): string {
        let s: string = this.filter.clean(value);
        if (STAR_REPLACE_REGEX.test(s.trim())) {
            return s.replace(STAR_REGEX, STAR_REPLACE_VALUE);
        }
        return s;
    }

    public deleteMessage(chatMessage: MessageObject): void {
        this.auth.getCurrentSessionId().subscribe(
            (data: CognitoIdToken) => {
                let httpHeaders = {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + data.getJwtToken()
                    })
                };

                if (this.userIsAdmin() && chatMessage.username != this.currentUserProfile.username) {
                    this.http
                        .delete(
                            this.messagesAPI +
                            chatMessage.messageId +
                            Constants.SLASH +
                            chatMessage.channelId +
                            Constants.SLASH +
                            chatMessage.insertTime +
                            Constants.SLASH +
                            chatMessage.username +
                            ADMIN_USERNAME_URI +
                            this.currentUserProfile.username,
                            httpHeaders
                        )
                        .subscribe(
                            () => {
                                this.chatMessages[this.chatMessages.indexOf(chatMessage)].deleted = ADMIN_TRUE_VALUE;
                                let notification: NotificationObject = {
                                    channelId: chatMessage.channelId,
                                    channelName: this.currentChannel.channelName,
                                    channelType: this.currentChannel.channelType,
                                    message:
                                        ADMIN_REMOVE_MESSAGE_A +
                                        this.currentUserProfile.username +
                                        ADMIN_REMOVE_MESSAGE_B +
                                        this.currentChannel.channelName +
                                        Constants.DOT,
                                    type: GENERAL_NOTIFICATION,
                                    username: chatMessage.username,
                                    fromFriend: this.currentUserProfile.username,
                                    notificationId: null,
                                    insertedTime: null
                                };
                                let notificationSocketObject: NotificationSocketObject = {
                                    fromUser: {
                                        id: this.notificationService.getSocketId(),
                                        username: this.currentUserProfile.username
                                    },
                                    toUser: this.notificationService.getOnlineUserByUsername(chatMessage.username),
                                    notification: notification
                                };
                                this.notificationService.sendNotification(notificationSocketObject);
                            },
                            (err) => {
                                this.error = err.toString();
                            }
                        );
                } else {
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
                                this.chatMessages[this.chatMessages.indexOf(chatMessage)].deleted = TRUE_VALUE;
                            },
                            (err) => {
                                this.error = err.toString();
                            }
                        );
                }
            },
            (err) => {
                console.error(err);
            }
        );
    }

    public toggleEditingChannelDescription(): void {
        if (!this.editingChannelDescription) {
            this.editingChannelDescription = true;
            this.channelDescForm.get(CHANNEL_DESC_IDENTIFIER).setValue(this.currentChannel.channelDescription);
        }
    }

    public toggleEditingMessage(chatMessage: MessageObject): void {
        if (!this.currentlyEditing) {
            this.currentlyEditing = true;
            this.chatMessages[this.chatMessages.indexOf(chatMessage)].editing = true;
            this.editForm.get(MESSAGE_CONTENT_IDENTIFIER).setValue(chatMessage.content);
        }
    }

    public editChannelDescriptionSubmit(form: FormGroup): void {
        this.auth.getCurrentSessionId().subscribe(
            (data) => {
                let httpHeaders = {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + data.getJwtToken()
                    })
                };

                this.currentChannel.channelDescription = form.value.channelDescription;

                this.http
                    .put(this.channelsURL + this.currentChannel.channelId, this.currentChannel, httpHeaders)
                    .subscribe(
                        () => {
                            this.editingChannelDescription = false;
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

    public editMessage(message: MessageObject, newContent: string): void {
        newContent = this.common.sanitizeText(newContent);
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
                        this.editForm.get(MESSAGE_CONTENT_IDENTIFIER).setValue(Constants.EMPTY);
                        this.chatMessages[this.chatMessages.indexOf(message)].content = newContent;
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

    public userIsAdmin(): boolean {
        if (this.subscribedUsers.length != 0 && this.subscribedUsersUsernames.length != 0 && this.currentUserProfile) {
            if (this.subscribedUsers[this.subscribedUsersUsernames.indexOf(this.currentUserProfile.username)]) {
                if (
                    this.subscribedUsers[this.subscribedUsersUsernames.indexOf(this.currentUserProfile.username)]
                        .userChannelRole == ADMIN_IDENTIFIER
                ) {
                    return true;
                }
            }
        }
        return false;
    }

    public handleNewEmojiReaction(message: MessageObject, emoji: string): void {
        this.addNewEmojiReaction(message.messageId, emoji);
        this.emojiPopup(message);
    }

    public handleReactionButtonClick(messageId: string, reaction: ReactionObject): void {
        if (reaction.username.includes(this.currentUserProfile.username)) {
            this.removeEmojiReaction(messageId, reaction.emoji);
        } else {
            this.addNewEmojiReaction(messageId, reaction.emoji);
        }
    }

    public emojiPopup(chatMessage: MessageObject): void {
        if (this.chatMessages[this.chatMessages.indexOf(chatMessage)].addingEmoji) {
            this.chatMessages[this.chatMessages.indexOf(chatMessage)].addingEmoji = false;
            this.toggleEmoji = false;
        } else {
            if (!this.toggleEmoji) {
                this.chatMessages[this.chatMessages.indexOf(chatMessage)].addingEmoji = true;
                this.toggleEmoji = true;
            }
        }
    }

    public emojiPopupMessage(): void {
        this.emojiMessage = !this.emojiMessage;
    }

    public handleMessageEmojiReaction(emoji: string): void {
        let text = this.messageForm.form.value.content as string;
        if (text == null) {
            text = Constants.EMPTY;
        }
        this.messageForm.setValue({ content: text + emoji });
    }

    public emojiClickOutside(): void {
        if (this.emojiMessage) {
            this.emojiMessage = false;
        }
    }

    public toggleMarkupTutorialOpen(): void {
        this.markupTutorialOpen = !this.markupTutorialOpen;

        if (this.markupTutorialOpen) {
            let dialogConfig = new MatDialogConfig();
            dialogConfig.disableClose = true;
            dialogConfig.autoFocus = false;
            dialogConfig.height = DIALOG_HEIGHT;
            dialogConfig.panelClass = DIALOG_CLASS;

            let dialogRef = this.dialog.open(MarkupTutorialComponent, dialogConfig);
            dialogRef.afterClosed().subscribe(() => {
                this.markupTutorialOpen = false;
            });
        }
    }

    public handleNewBannedUser(user: UserChannelObject): void {
        this.sendUserBannedStatus(user);
        this.usersWithoutBanned.splice(this.mentionList.indexOf(user.username), 1);
        this.resetMentionList();
    }

    public handleNewUnBannedUser(user: UserChannelObject) {
        this.sendUserUnBannedStatus(user);
        this.usersWithoutBanned.push(user.username);
        this.resetMentionList();
    }

    public toggleSideBarOpen(value: boolean): void {
        if (value) {
            this.sidebarOpened = true;
            document.getElementById(MESSAGE_CONTENT_IDENTIFIER).classList.add(CONTENT_OPENED_CLASS);
            document.getElementById(SIDEBAR_IDENTIFIER).classList.remove(SIDEBAR_CLOSED_CLASS);
            document.getElementById(INFO_IDENTIFIER).classList.add(BACKGROUND_DARKER_CLASS);
        } else {
            this.sidebarOpened = false;
            document.getElementById(MESSAGE_CONTENT_IDENTIFIER).classList.remove(CONTENT_OPENED_CLASS);
            document.getElementById(SIDEBAR_IDENTIFIER).classList.add(SIDEBAR_CLOSED_CLASS);
            document.getElementById(INFO_IDENTIFIER).classList.remove(BACKGROUND_DARKER_CLASS);
        }
    }

    private addNewEmojiReaction(messageId: string, emoji: string): void {
        this.notificationService.sendReaction({
            emoji: emoji,
            username: this.currentUserProfile.username,
            messageId: messageId
        });
    }

    private removeEmojiReaction(messageId: string, emoji: string): void {
        this.notificationService.removeReaction({
            messageId: messageId,
            emoji: emoji,
            username: this.currentUserProfile.username
        });
    }

    private sendMentionNotification(username): void {
        let message: string;
        if (this.currentChannel.channelType == FRIEND_CHANNEL_TYPE) {
            message = this.currentUserProfile.username + DIRECT_MESSAGES_MESSAGE;
        } else {
            message = this.currentUserProfile.username + CHANNEL_MESSAGE + this.currentChannel.channelName;
        }
        let notifications: NotificationSocketObject = {
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
                message: message,
                type: GENERAL_NOTIFICATION,
                username: username,
                notificationId: null,
                insertedTime: null
            }
        };

        this.notificationService.sendNotification(notifications);
    }

    private markUpMentions(text: string): string {
        if (text) {
            text = text.replace(NEWLINE_REGEX, DOUBLE_NEWLINE);
            let atUsernameRegExp = MENTION_REGEX;
            let result;
            let indexs = [];
            while ((result = atUsernameRegExp.exec(text))) {
                if (!CHECK_REGEX.test(text.substring(result.index - 1, result.index))) {
                    let endIndex = text.substring(result.index).indexOf(Constants.SPACE);
                    if (endIndex == -1) {
                        endIndex = text.length;
                    }
                    endIndex = result.index + endIndex;

                    let user = text.substring(result.index, endIndex);
                    if (this.mentionList.includes(user.substring(1))) {
                        indexs.push({
                            begin: result.index,
                            end: endIndex,
                            user: user
                        });
                    }
                }
            }
            let retText = Constants.EMPTY;
            if (indexs.length > 0) {
                retText = text.substring(0, indexs[0].begin);
                for (let i = 0; i < indexs.length; i++) {
                    retText += CHECK_TEXT;
                    retText += indexs[i].user;
                    retText += CHECK_TEXT;
                    if (i != indexs.length - 1) {
                        retText += text.substring(indexs[i].end, indexs[i + 1].begin);
                    }
                }
                retText += text.substring(indexs[indexs.length - 1].end, text.length);
                return retText;
            }

            return text;
        } else return null;
    }

    private sendUserBannedStatus(user: UserChannelObject): void {
        let chatMessage = {
            channelId: user.channelId,
            username: null,
            content: user.username + ADMIN_REMOVE_MESSAGE,
            profileImage: null
        };
        this.isNearBottom = false;
        this.messagerService.sendMessage(chatMessage);
    }

    private sendUserUnBannedStatus(user: UserChannelObject): void {
        let chatMessage = {
            channelId: user.channelId,
            username: null,
            content: user.username + ADMIN_BAN_MESSAGE,
            profileImage: null
        };
        this.isNearBottom = false;
        this.messagerService.sendMessage(chatMessage);
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

    private getSubcribedUsers(): Promise<Array<UserChannelObject>> {
        return new Promise<Array<UserChannelObject>>((resolve, reject) => {
            this.auth.getCurrentSessionId().subscribe(
                (data: CognitoIdToken) => {
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
                            let usersWithoutBanned: Array<string> = [];
                            for (let i in data) {
                                usernames.push(data[i].username);
                                if (data[i].userChannelRole != BANNED_IDENTIFIER) {
                                    usersWithoutBanned.push(data[i].username);
                                }
                            }
                            this.subscribedUsersUsernames = usernames;
                            this.usersWithoutBanned = usersWithoutBanned;
                            this.resetMentionList();
                            resolve(data);
                        },
                        (err) => {
                            console.error(err);
                            reject(err);
                        }
                    );
                },
                (err) => {
                    console.error(err);
                    reject(err);
                }
            );
        });
    }

    private getChannelNotifications(): Promise<Array<NotificationObject>> {
        return new Promise<Array<NotificationObject>>((resolve, reject) => {
            this.auth.getCurrentSessionId().subscribe(
                (data: CognitoIdToken) => {
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
                                    if (data[i].type == PUBLIC || data[i].type == PRIVATE || data[i].type == FRIEND) {
                                        usernames.push(data[i].username);
                                    }
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

    private getChannelInfo(): Promise<InviteChannelObject> {
        return new Promise<InviteChannelObject>((resolve, reject) => {
            this.auth.getCurrentSessionId().subscribe(
                (cogData: CognitoIdToken) => {
                    if (this.currentChannel) {
                        let httpHeaders = {
                            headers: new HttpHeaders({
                                "Content-Type": "application/json",
                                Authorization: "Bearer " + cogData.getJwtToken()
                            })
                        };

                        this.http.get(this.channelsURL + this.currentChannel.channelId, httpHeaders).subscribe(
                            (data: InviteChannelObject) => {
                                if (data) {
                                    this.currentChannel.channelDescription = data.channelDescription;
                                }
                                resolve(data);
                            },
                            (err) => {
                                reject(err);
                            }
                        );
                    }
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
            console.error(err);
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

    private mentionListSearch(search: string): boolean {
        let origMentionList = [...this.mentionList];
        if (search == Constants.EMPTY) {
            this.resetMentionList();
            return false;
        } else {
            for (let user of origMentionList) {
                if (this.common.searchStrings(user.toLowerCase(), search.toLowerCase())) {
                    if (this.mentionList.indexOf(user) === -1) {
                        this.mentionList.push(user);
                    }
                } else {
                    if (this.mentionList[this.mentionList.indexOf(user)]) {
                        this.mentionList.splice(this.mentionList.indexOf(user), 1);
                    }
                }
            }
        }
        return true;
    }

    private resetMentionList(): void {
        this.selectingFromMention = false;
        this.mentionList = [...this.usersWithoutBanned];
        this.mentionList.push(MENTION_EVERYONE_IDENTIFIER);
        this.selectedMentionIndex = -1;
        this.mentioning = false;
        this.mentioningIndex = 0;
    }

    private checkForTextAreaHeight(): void {
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

    private addMentionIfMentionable(userToMention): void {
        if (this.mentionList.includes(userToMention) && !this.mentionListToSubmit.includes(userToMention)) {
            this.mentionListToSubmit.push(userToMention);
        }
    }

    private getReactionsForMessage(messageId: string): Promise<Array<ReactionObject>> {
        return new Promise<any>((resolve, reject) => {
            this.auth.getCurrentSessionId().subscribe(
                (data: CognitoIdToken) => {
                    let httpHeaders = {
                        headers: new HttpHeaders({
                            "Content-Type": "application/json",
                            Authorization: "Bearer " + data.getJwtToken()
                        })
                    };

                    this.http.get(this.messagesAPI + messageId + REACTIONS_URI, httpHeaders).subscribe(
                        (data: Array<ReactionObject>) => {
                            resolve(data);
                        },
                        (err) => {
                            console.error(err);
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

    private getMoreMessages(): void {
        this.auth.getCurrentSessionId().subscribe(
            (data: CognitoIdToken) => {
                let httpHeaders = {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + data.getJwtToken()
                    })
                };

                this.http
                    .get(this.channelsURL + this._currentChannel.channelId + MESSAGES_URI + this.loadCount, httpHeaders)
                    .subscribe(
                        (data: Array<MessageObject>) => {
                            if (data.length > 0) {
                                if (!this.settings.explicit) {
                                    for (let i = 0; i < data.length; i++) {
                                        data[i].content = this.filterClean(data[i].content);
                                    }
                                }

                                this.chatMessages = data.concat(this.chatMessages);

                                let top = (document
                                    .getElementsByClassName(this.messageToScrollTo.messageId)
                                    .item(0) as HTMLElement).offsetTop;
                                this.scrollContainer.nativeElement.scrollTop = top - SCROLL_UP_PEEK_PREVIEW_AMOUNT;

                                for (let i = this.loadCount + 1; i < this.chatMessages.length; i++) {
                                    this.getReactionsForMessage(this.chatMessages[i].messageId).then((reactions) => {
                                        this.chatMessages[i].reactions = reactions;
                                    });
                                }

                                this.loadCount += data.length;
                            }
                        },
                        (err) => {
                            this.error = err.toString();
                        }
                    );
            },
            (err) => {
                console.error(err);
            }
        );
    }

    private getFriendsProfilePicture(username: string): void {
        this.auth.getCurrentSessionId().subscribe((data) => {
            let httpHeaders = {
                headers: new HttpHeaders({
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + data.getJwtToken()
                })
            };

            this.http.get(this.profilesAPI + username, httpHeaders).subscribe(
                (data: Array<ProfileObject>) => {
                    this.friendsProfileImage = data[0].profileImage += Constants.QUESTION_MARK + Math.random();
                },
                (err) => {
                    console.error(err);
                }
            );
        });
    }
}
