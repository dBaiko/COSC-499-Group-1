import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { AuthenticationService } from "../../shared/authentication.service";
import {
    APIConfig,
    ChannelAndNumUsers,
    ChannelObject,
    Constants,
    ProfileObject,
    UserChannelObject
} from "../../shared/app-config";
import { CommonService } from "../../shared/common.service";
import { CognitoIdToken } from "amazon-cognito-identity-js";

const CHANNEL_NAME: string = "channelName";
const FILTERED: string = "filtered";
const DEFAULT_CHANNEL_ROLE: string = "user";
const PRIVATE_CHANNEL_TYPE: string = "private";
const FRIEND_CHANNEL_TYPE: string = "friend";

@Component({
    selector: "app-channel-browser",
    templateUrl: "./channel-browser.component.html",
    styleUrls: ["./channel-browser.component.scss"]
})
export class ChannelBrowserComponent implements OnInit {
    subscribedChannels: string[] = [];
    channels: Array<ChannelAndNumUsers> = [];

    search = Constants.EMPTY;

    @Input() currentUserProfile: ProfileObject;
    @Output() newChannelIdEvent = new EventEmitter<any>();

    private channelsAPI = APIConfig.channelsAPI;
    private usersAPI = APIConfig.usersAPI;

    constructor(private http: HttpClient, private auth: AuthenticationService, private common: CommonService) {
    }

    private _newChannel: ChannelAndNumUsers;

    public get newChannel(): ChannelObject {
        return this._newChannel;
    }

    @Input()
    public set newChannel(value: ChannelObject) {
        if (value) {
            this._newChannel = value;
            this._newChannel.numUsers = 1;
            this.channels.push(value);
            this.subscribedChannels.push(value.channelId);
        }
    }

    public ngOnInit() {
        this.getChannels()
            .then(() => {
            })
            .catch((err) => {
                console.error(err);
            });
        this.getSubscribedChannels();
    }

    public getSubscribedChannels(): void {
        this.auth.getCurrentSessionId().subscribe(
            (data: CognitoIdToken) => {
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
                        (data: Object[]) => {
                            data.forEach((item: UserChannelObject) => {
                                this.subscribedChannels.push(item.channelId);
                            });
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

    public sendQuery(): void {
        for (let i in this.channels) {
            this.channels[i][FILTERED] = !this.channels[i][CHANNEL_NAME].includes(this.search.toString());
        }
    }

    public onKey($event: Event): void {
        //set search value as whatever is entered on search bar every keystroke
        this.search = ($event.target as HTMLInputElement).value;
        this.search = this.common.sanitizeText(this.search);

        this.sendQuery();
    }

    public getChannels(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.auth.getCurrentSessionId().subscribe(
                (data) => {
                    let httpHeaders = {
                        headers: new HttpHeaders({
                            "Content-Type": "application/json",
                            Authorization: "Bearer " + data.getJwtToken()
                        })
                    };

                    this.http.get(this.channelsAPI, httpHeaders).subscribe(
                        (data: Array<ChannelObject>) => {
                            this.channels = data;
                            for (let i = 0; i < this.channels.length; i++) {
                                if (
                                    this.channels[i].channelType == PRIVATE_CHANNEL_TYPE ||
                                    this.channels[i].channelType == FRIEND_CHANNEL_TYPE
                                ) {
                                    this.channels.splice(i, 1);
                                    i--;
                                }
                            }
                            resolve();
                        },
                        (err) => {
                            console.error(err);
                            reject();
                        }
                    );
                },
                (err) => {
                    console.error(err);
                }
            );
        });
    }

    public joinChannel(channel: ChannelObject): void {
        this.subscribedChannels.push(channel.channelId);

        this.auth.getCurrentSessionId().subscribe(
            (data: CognitoIdToken) => {
                let httpHeaders = {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + data.getJwtToken()
                    })
                };

                let user: UserChannelObject = {
                    username: this.auth.getAuthenticatedUser().getUsername(),
                    channelId: channel.channelId,
                    userChannelRole: DEFAULT_CHANNEL_ROLE,
                    channelName: channel.channelName,
                    channelType: channel.channelType,
                    profileImage: this.currentUserProfile.profileImage,
                    statusText: this.currentUserProfile.statusText
                };

                this.newChannelIdEvent.emit({
                    channelId: channel.channelId,
                    channelName: channel.channelName,
                    channelType: channel.channelType
                });

                this.http
                    .post(this.channelsAPI + channel.channelId + Constants.USERS_PATH, user, httpHeaders)
                    .subscribe(
                        () => {
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
}
