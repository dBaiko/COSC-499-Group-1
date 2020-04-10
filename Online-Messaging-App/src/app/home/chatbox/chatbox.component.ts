import { AfterViewChecked, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { MessengerService } from "../../shared/messenger.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import {
    APIConfig,
    ChannelObject,
    Constants,
    EmojiList,
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

const whitespaceRegEx: RegExp = /^\s+$/i;
const STAR_REPLACE_REGEX: RegExp = /^\*+$/;
const STAR_REGEX: RegExp = /\*/g;
const NEW_LINE_REGEX: RegExp = /(?:\r\n|\r|\n)/g;
const STAR_REPLACE_VALUE: string = "\\*";
const MESSAGES_URI: string = "/messages/loadCount/";
const USERS_URI: string = "/users";
const NOTIFICATIONS_URI = "/notifications";
const NOTIFICATION_MESSAGE: string = "You have been invited to join ";
const MESSAGE_FORM_IDENTIFIER: string = "messageForm";
const TEXT_AREA_IDENTIFIER: string = "textArea";
const SCROLL_FRAME_IDENTIFIER: string = "scrollframe";
const HIDDEN_BUTTON_IDENTIFIER: string = "hiddenButton";
const FRIEND_IDENTIFIER: string = "friend";
const PENDING_INVITE_IDENTIFIER: string = "pending";
const DENIED_INVITE_IDENTIFIER: string = "denied";
const ACCEPTED_INVITE_IDENTIFIER: string = "accepted";
const GENERAL_NOTIFICATION: string = "general";
const EMOJI_POPUP: string = "emojiClick";
const EMOJI_DIV: string = "emojiDiv";
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

    editForm: FormGroup;
    channelDescForm: FormGroup;

    @ViewChild(TEXT_AREA_IDENTIFIER) textArea: ElementRef;

    inviting: boolean = false;
    editingChannelDescription: boolean = false;
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
    @Input() onlineUserList: Array<UserObject>;
    @Output() profileViewEvent = new EventEmitter<string>();
    @ViewChild(SCROLL_FRAME_IDENTIFIER) scrollContainer: ElementRef;
    toggleEmoji = false;
    private channelsURL: string = APIConfig.channelsAPI;
    private messagesAPI: string = APIConfig.messagesAPI;
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
        this.getChannelInfo().catch((err) => {
            console.error(err);
        });
        this.getMessages(this._currentChannel.channelId)
            .then(() => {
                for (let message of this.chatMessages) {
                    this.getReactionsForMessage(message.messageId)
                        .then((data: Array<ReactionObject>) => {
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

        this.notificationService.addSocketListener("broadcast_reaction_add", (reaction: ReactionSocketObject) => {
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
                    if (!this.chatMessages[messageIndex].reactions[reactionIndex].username.includes(reaction.username)) {
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

        this.notificationService.addSocketListener("broadcast_reaction_remove", (reaction: ReactionSocketObject) => {
            for (let i = 0; i < this.chatMessages.length; i++) {
                if (this.chatMessages[i].messageId == reaction.messageId) {
                    for (let j = 0; j < this.chatMessages[i].reactions.length; j++) {
                        if (this.chatMessages[i].reactions[j].emoji == reaction.emoji) {
                            this.chatMessages[i].reactions[j].username.splice(this.chatMessages[i].reactions[j].username.indexOf(reaction.username), 1);
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
        });

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
            this.handleInput();
            value.content = this.markUpMentions(value.content);
            if (this.mentionListToSubmit.includes("everyone")) {
                for (let user of this.mentionList) {
                    if (user != "everyone") {
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

        if (element.scrollTop == 0) {
            this.messageToScrollTo = this.chatMessages[0];
            this.getMoreMessages();
        }
    }


    textAreaSubmit(event) {
        if (event.keyCode == 13 && event.shiftKey) {
        } else if (event.keyCode == 13 && !this.selectingFromMention) {
            event.preventDefault();
            this.resetMentionList();
            this.messageForm.ngSubmit.emit();
            return;
        } else if (event.keyCode == 38) {
            event.preventDefault();
        }

        this.checkForTextAreaHeight();
    }

    handleMentioning(event) {
        let text = (this.messageForm.form.value.content as string);
        if (text) {
            if (this.selectingFromMention) {
                if (event.keyCode == 38 || event.keyCode == 40) {
                    event.preventDefault();
                    if (event.keyCode == 38) {
                        this.selectedMentionIndex--;
                    } else if (event.keyCode == 40) {
                        this.selectedMentionIndex++;
                    }
                    if (this.selectedMentionIndex < 0) {
                        this.selectedMentionIndex = 0;
                    } else if (this.selectedMentionIndex > this.mentionList.length) {
                        this.selectedMentionIndex = -1;
                        this.selectingFromMention = false;
                    }
                } else if (event.keyCode == 13) {
                    let userToMention = this.mentionList[this.selectedMentionIndex];
                    this.messageForm.setValue({ content: text.substring(0, text.lastIndexOf("@") + 1) + userToMention + " " });
                    this.addMentionIfMentionable(userToMention);
                    this.resetMentionList();
                } else {
                    this.selectedMentionIndex = -1;
                    this.selectingFromMention = false;
                }
            } else if (this.mentioning) {
                if (event.keyCode == 32) {
                    let userToMention = text.substring(this.mentioningIndex, text.lastIndexOf(" "));
                    this.addMentionIfMentionable(userToMention);
                    this.resetMentionList();
                } else if (event.keyCode == 38) {
                    event.preventDefault();
                    this.selectingFromMention = true;
                    this.selectedMentionIndex = this.mentionList.length - 1;
                } else if (event.keyCode == 16) {
                    event.preventDefault();
                } else {
                    let partialUsername = text.substring(this.mentioningIndex);
                    this.mentionListSearch(partialUsername);
                }
            } else {
                if (event.keyCode == 50) {
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

    clickMentionList(username: string) {
        let text = (this.messageForm.form.value.content as string);
        this.messageForm.setValue({ content: text.substring(0, text.lastIndexOf("@") + 1) + username + " " });
        this.addMentionIfMentionable(username);
        this.resetMentionList();
    }

    handleInput() {
        let text = (this.messageForm.form.value.content as string);
        let highlightedText = this.applyHighlights(text);
        document.getElementsByClassName("highlights")[0].innerHTML = highlightedText;
    }

    applyHighlights(text: string): string {
        if (text) {
            text = text.replace(/\n$/g, "\n\n");
            let atUsernameRegExp = /(@[a-zA-Z]+)/g;
            let result;
            let indexs = [];
            while ((result = atUsernameRegExp.exec(text))) {
                if (!/<mark style='background-color: var(--primary-color)'>/g.test(text.substring(result.index - 40, result.index))) {
                    let endIndex = text.substring(result.index).indexOf(" ");
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
            let retText = "";
            if (indexs.length > 0) {
                retText = text.substring(0, indexs[0].begin);
                for (let i = 0; i < indexs.length; i++) {
                    retText += "<mark style='background-color: var(--primary-color)'>";
                    retText += indexs[i].user;
                    retText += "</mark>";
                    if (i != indexs.length - 1) {
                        retText += text.substring(indexs[i].end, indexs[i + 1].begin);
                    }

                }
                return retText;
            }

            return text;
        } else
            return null;
    }

    handleScroll() {
        let scrollTop = document.getElementById("messageInputField").scrollTop;
        document.getElementById("backdrop").scrollTop = scrollTop;
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

    toggleEditingChannelDescription() {
        if (!this.editingChannelDescription) {
            this.editingChannelDescription = true;
            this.channelDescForm.get("channelDescription").setValue(this.currentChannel.channelDescription);
        }
    }

    toggleEditingMessage(chatMessage: MessageObject) {
        if (!this.currentlyEditing) {
            this.currentlyEditing = true;
            this.chatMessages[this.chatMessages.indexOf(chatMessage)].editing = true;
            this.editForm.get("content").setValue(chatMessage.content);
        }
    }

    editChannelDescriptionSubmit(form: FormGroup) {
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
                            console.log(err);
                        }
                    );
            },
            (err) => {
                console.log(err);
            }
        );
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

    emojiPopup(chatMessage: MessageObject) {
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

    emojiPopupMessage() {
        if (!this.emojiMessage) {
            this.emojiMessage = true;
        } else {
            this.emojiMessage = false;
        }

    }

    handleMessageEmojiReaction(emoji: string): void {
        let text = (this.messageForm.form.value.content as string);
        if (text == null) {
            text = Constants.EMPTY;
        }
        this.messageForm.setValue({ content: text + emoji });
    }

    emojiClickOutside() {
        if (this.emojiMessage) {
            this.emojiMessage = false;
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
        let message: string = this.currentUserProfile.username + " has mentioned you on " + this.currentChannel.channelName;
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

    private markUpMentions(text: string) {
        if (text) {
            text = text.replace(/\n$/g, "\n\n");
            let atUsernameRegExp = /(@[a-zA-Z]+)/g;
            let result;
            let indexs = [];
            while ((result = atUsernameRegExp.exec(text))) {
                if (!/`/g.test(text.substring(result.index - 1, result.index))) {
                    let endIndex = text.substring(result.index).indexOf(" ");
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
            let retText = "";
            if (indexs.length > 0) {
                retText = text.substring(0, indexs[0].begin);
                for (let i = 0; i < indexs.length; i++) {
                    retText += "`";
                    retText += indexs[i].user;
                    retText += "`";
                    if (i != indexs.length - 1) {
                        retText += text.substring(indexs[i].end, indexs[i + 1].begin);
                    }

                }
                retText += text.substring(indexs[indexs.length - 1].end, text.length);
                return retText;
            }

            return text;
        } else
            return null;
    }

    private sendStatus(newUsersSubbedChannel: NewUsersSubbedChannelObject): void {
        if (!this.subscribedUsersUsernames.includes(newUsersSubbedChannel.username)) {
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
                            this.resetMentionList();
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
                            this.currentChannel.channelDescription = data.channelDescription;
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
        this.mentionList = [...this.subscribedUsersUsernames];
        this.mentionList.push("everyone");
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
                (data) => {
                    let httpHeaders = {
                        headers: new HttpHeaders({
                            "Content-Type": "application/json",
                            Authorization: "Bearer " + data.getJwtToken()
                        })
                    };

                    this.http.get(this.messagesAPI + messageId + "/reactions", httpHeaders).subscribe(
                        (data: Array<ReactionObject>) => {
                            resolve(data);
                        },
                        (err) => {
                            console.log(err);
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
            (data) => {
                let httpHeaders = {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + data.getJwtToken()
                    })
                };

                this.http.get(this.channelsURL + this._currentChannel.channelId + MESSAGES_URI + this.loadCount, httpHeaders).subscribe(
                    (data: Array<MessageObject>) => {
                        if (data.length > 0) {
                            if (!this.settings.explicit) {
                                for (let i = 0; i < data.length; i++) {
                                    data[i].content = this.filterClean(data[i].content);
                                }
                            }

                            this.chatMessages = data.concat(this.chatMessages);

                            let top = document.getElementById(this.messageToScrollTo.messageId).offsetTop;
                            this.scrollContainer.nativeElement.scrollTop = top - 150;


                            for (let i = this.loadCount + 1; i < this.chatMessages.length; i++) {
                                this.getReactionsForMessage(this.chatMessages[i].messageId)
                                    .then((reactions) => {
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
                console.log(err);
            }
        );
    }

}
