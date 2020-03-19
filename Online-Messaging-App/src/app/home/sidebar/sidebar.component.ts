import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { AuthenticationService } from "../../shared/authentication.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { APIConfig, Constants } from "../../shared/app-config";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { CreateChannelComponent } from "../createChannel/create-channel.component";
import { CookieService } from "ngx-cookie-service";
import { UserChannelObject } from "../home.component";
import { UnsubscribeConfirmComponent } from "./unsubscribe-confirm/unsubscribe-confirm.component";

interface UserObject {
    username: string;
    email: string;
}

interface ChannelIdAndType {
    channelId: string;
    type: string;
}

export interface ChannelObject {
    channelId: string;
    channelName: string;
    channelType: string;
}

const PRIVATE: string = "private";
const PUBLIC: string = "public";
const FRIEND: string = "friend";
const SELECTED: string = "selected";

const CHANNELS_URI = "/channels/";

@Component({
    selector: "app-sidebar",
    templateUrl: "./sidebar.component.html",
    styleUrls: ["./sidebar.component.scss"]
})
export class SidebarComponent implements OnInit {
    publicChannels = [];
    privateChannels = [];
    friendsChannels = [];
    userSubscribedChannels = [];
    @Input() userList: Array<UserObject>;
    @Output() channelEvent = new EventEmitter<ChannelObject>();
    @Output() newChannelEvent = new EventEmitter<ChannelObject>();
    @Output() switchEvent = new EventEmitter<string>();
    @Output() profileViewEvent = new EventEmitter<string>();
    publicChannelSelect: boolean;
    privateChannelSelect: boolean;
    friendChannelSelect: boolean;
    list;
    private chatBox = "chatBox";
    private channelBrowser = "channelBrowser";
    private profile = "profile";
    private usersAPI: string = APIConfig.usersAPI;

    constructor(
        private http: HttpClient,
        private cookieService: CookieService,
        private auth: AuthenticationService,
        private dialog: MatDialog
    ) {
    }

    private _notificationChannel: ChannelIdAndType;

    @Input()
    set notificationChannel(value: ChannelIdAndType) {
        if (value) {
            this._notificationChannel = value;
            this.selectChannel(value.channelId, value.type);
            this.switchDisplay(this.chatBox);
            if (value.type == PUBLIC) {
                this.selectPublicChannel();
            } else if (value.type == PRIVATE) {
                this.selectPrivateChannel();
            } else if (value.type == FRIEND) {
                this.selectFriend();
            }
        }
    }

    private _subbedChannel: ChannelObject;

    get subbedChannel(): ChannelObject {
        return this._subbedChannel;
    }

    @Input()
    set subbedChannel(value: ChannelObject) {
        this.setNewChannel(value);
    }

    ngOnInit(): void {
        let user: string = this.auth.getAuthenticatedUser().getUsername();
        this.getSubscribedChannels()
            .then((data: Array<UserChannelObject>) => {
                if (this.cookieService.get(user)) {
                    this.switchDisplay(this.chatBox);
                    this.selectChannel(
                        JSON.parse(this.cookieService.get(user)).lastChannelID,
                        JSON.parse(this.cookieService.get(user)).lastChannelType
                    );
                    if (JSON.parse(this.cookieService.get(user)).lastChannelType == FRIEND) {
                        this.selectFriend();
                    }
                    if (JSON.parse(this.cookieService.get(user)).lastChannelType == PRIVATE) {
                        this.selectPrivateChannel();
                    }
                    if (JSON.parse(this.cookieService.get(user)).lastChannelType == PUBLIC) {
                        this.selectPublicChannel();
                    }
                } else if (data.length == 0) {
                    this.switchDisplay(this.channelBrowser);
                    this.selectPublicChannel();
                } else {
                    this.selectPublicChannel();
                    this.selectChannel(this.publicChannels[0].channelId, PUBLIC);
                }
            })
            .catch((err) => {
                console.log(err);
            });
    }

    getSubscribedChannels(): Promise<any> {
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
                        .get(
                            this.usersAPI + this.auth.getAuthenticatedUser().getUsername() + Constants.CHANNELS_PATH,
                            httpHeaders
                        )
                        .subscribe(
                            (data: Array<UserChannelObject>) => {
                                this.publicChannels = [];
                                this.privateChannels = [];
                                this.friendsChannels = [];
                                this.userSubscribedChannels = data;
                                this.userSubscribedChannels.forEach((item: UserChannelObject) => {
                                    if (item.channelType == PUBLIC) {
                                        this.publicChannels.push(item);
                                    } else if (item.channelType == PRIVATE) {
                                        this.privateChannels.push(item);
                                    } else {
                                        this.friendsChannels.push(item);
                                    }
                                });
                                if (this.userSubscribedChannels.length > 0) {
                                    this.channelEvent.emit(this.userSubscribedChannels[0]);
                                    this.userSubscribedChannels[0][SELECTED] = true;
                                }
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

    parseFriendChannelName(channelName: string): string {
        let users = channelName.split("-", 2);
        if (users[0] == this.auth.getAuthenticatedUser().getUsername()) return users[1];
        else return users[0];
    }

    selectPublicChannel(): void {
        this.publicChannelSelect = true;
        this.privateChannelSelect = false;
        this.friendChannelSelect = false;
    }

    selectPrivateChannel(): void {
        this.publicChannelSelect = false;
        this.privateChannelSelect = true;
        this.friendChannelSelect = false;
    }

    selectFriend(): void {
        this.publicChannelSelect = false;
        this.privateChannelSelect = false;
        this.friendChannelSelect = true;
    }

    selectChannel(id: string, type: string) {
        this.userSubscribedChannels.forEach((item: UserChannelObject) => {
            if (item.channelId == id) {
                this.channelEvent.emit({
                    channelId: item.channelId,
                    channelName: item.channelName,
                    channelType: item.channelType
                });
                item[SELECTED] = true;
                this.cookieService.set(
                    this.auth.getAuthenticatedUser().getUsername(),
                    JSON.stringify({
                        lastChannelID: id,
                        lastChannelType: type
                    }),
                    null,
                    null,
                    null,
                    null,
                    "Lax"
                );
            } else {
                item[SELECTED] = false;
            }
        });
    }

    joinChannel(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.width = "35%";
        dialogConfig.panelClass = "dialog-class";
        let dialogRef = this.dialog.open(CreateChannelComponent, dialogConfig);
        dialogRef.afterClosed().subscribe((result: UserChannelObject) => {
            if (result) {
                this.newChannelEvent.emit(result);
                this.userSubscribedChannels.push(result);
                if (result.channelType == PUBLIC) {
                    this.publicChannels.push(result);
                    this.selectPublicChannel();
                } else if (result.channelType == PRIVATE) {
                    this.privateChannels.push(result);
                    this.selectPrivateChannel();
                } else {
                    this.friendsChannels.push(result);
                    this.selectFriend();
                }
                this.switchDisplay(this.chatBox);
                this.selectChannel(result.channelId, result.channelType);
            }
        });
    }

    confirmUnsubscribe(channelId: string): void {
        let dialogConfig: MatDialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.width = "35%";
        dialogConfig.panelClass = "dialog-class";
        let dialogRef = this.dialog.open(UnsubscribeConfirmComponent, dialogConfig);
        dialogRef.afterClosed().subscribe((result: boolean) => {
            if (result) {
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
                                this.usersAPI +
                                this.auth.getAuthenticatedUser().getUsername() +
                                CHANNELS_URI +
                                channelId,
                                httpHeaders
                            )
                            .subscribe(
                                (data) => {
                                    for (let i = 0; i < this.userSubscribedChannels.length; i++) {
                                        if (this.userSubscribedChannels[i].channelId == channelId) {
                                            this.userSubscribedChannels.splice(i, 1);
                                        }
                                    }
                                    for (let i = 0; i < this.publicChannels.length; i++) {
                                        if (this.publicChannels[i].channelId == channelId) {
                                            this.publicChannels.splice(i, 1);
                                        }
                                    }
                                    for (let i = 0; i < this.privateChannels.length; i++) {
                                        if (this.privateChannels[i].channelId == channelId) {
                                            this.privateChannels.splice(i, 1);
                                        }
                                    }
                                    for (let i = 0; i < this.friendsChannels.length; i++) {
                                        if (this.friendsChannels[i].channelId == channelId) {
                                            this.friendsChannels.splice(i, 1);
                                        }
                                    }
                                    //TODO: reduce this, or at least move to a method
                                    if (this.publicChannelSelect) {
                                        if (this.publicChannels.length > 0) {
                                            this.selectPublicChannel();
                                            this.selectChannel(this.publicChannels[0].channelId, PUBLIC);
                                        } else if (this.privateChannels.length > 0) {
                                            this.selectPrivateChannel();
                                            this.selectChannel(this.privateChannels[0].channelId, PRIVATE);
                                        } else if (this.friendsChannels.length > 0) {
                                            this.selectFriend();
                                            this.selectChannel(this.friendsChannels[0].channelId, FRIEND);
                                        } else {
                                            this.selectPublicChannel();
                                            this.switchDisplay(this.channelBrowser);
                                            this.cookieService.delete(this.auth.getAuthenticatedUser().getUsername());
                                        }
                                    } else if (this.privateChannelSelect) {
                                        if (this.privateChannels.length > 0) {
                                            this.selectPrivateChannel();
                                            this.selectChannel(this.privateChannels[0].channelId, PRIVATE);
                                        } else if (this.publicChannels.length > 0) {
                                            this.selectPublicChannel();
                                            this.selectChannel(this.publicChannels[0].channelId, PUBLIC);
                                        } else if (this.friendsChannels.length > 0) {
                                            this.selectFriend();
                                            this.selectChannel(this.friendsChannels[0].channelId, FRIEND);
                                        } else {
                                            this.selectPublicChannel();
                                            this.switchDisplay(this.channelBrowser);
                                            this.cookieService.delete(this.auth.getAuthenticatedUser().getUsername());
                                        }
                                    } else if (this.friendChannelSelect) {
                                        if (this.friendsChannels.length > 0) {
                                            this.selectFriend();
                                            this.selectChannel(this.friendsChannels[0].channelId, FRIEND);
                                        } else if (this.publicChannels.length > 0) {
                                            this.selectPublicChannel();
                                            this.selectChannel(this.publicChannels[0].channelId, PUBLIC);
                                        } else if (this.privateChannels.length > 0) {
                                            this.selectPrivateChannel();
                                            this.selectChannel(this.privateChannels[0].channelId, PRIVATE);
                                        } else {
                                            this.selectPublicChannel();
                                            this.switchDisplay(this.channelBrowser);
                                            this.cookieService.delete(this.auth.getAuthenticatedUser().getUsername());
                                        }
                                    }
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
        });
    }

    switchDisplay(value: string): void {
        this.switchEvent.emit(value);

        if (value === this.profile) {
            this.profileViewEvent.emit(this.auth.getAuthenticatedUser().getUsername());
        }
    }

    private setNewChannel(value: ChannelObject) {
        if (value) {
            this._subbedChannel = value;
            this.userSubscribedChannels.push(value);
            if (value.channelType == PUBLIC) {
                this.publicChannels.push(value);
                this.selectPublicChannel();
            } else if (value.channelType == PRIVATE) {
                this.privateChannels.push(value);
                this.selectPrivateChannel();
            } else {
                this.friendsChannels.push(value);
                this.selectFriend();
            }
            this.switchDisplay(this.chatBox);
            this.selectChannel(value.channelId, value.channelType);
        }
    }
}
