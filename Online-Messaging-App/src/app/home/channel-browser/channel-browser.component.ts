import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { AuthenticationService } from "../../shared/authentication.service";
import { APIConfig, ChannelObject, Constants, ProfileObject, UserChannelObject } from "../../shared/app-config";

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
    channels: Array<ChannelObject> = [];

    search = Constants.EMPTY;

    @Input() currentUserProfile: ProfileObject;
    @Output() newChannelIdEvent = new EventEmitter<any>();

    private channelsAPI = APIConfig.channelsAPI;
    private usersAPI = APIConfig.usersAPI;

    constructor(private http: HttpClient, private auth: AuthenticationService) {
    }

    private _newChannel: ChannelObject;

    get newChannel(): ChannelObject {
        return this._newChannel;
    }

    @Input()
    set newChannel(value: ChannelObject) {
        if (value) {
            this._newChannel = value;
            this.channels.push(value);
            this.subscribedChannels.push(value.channelId);
        }
    }

    ngOnInit() {
        this.getChannels();
        this.getSubscribedChannels();
    }

    getSubscribedChannels() {
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
                        (data: Object[]) => {
                            data.forEach((item: UserChannelObject) => {
                                this.subscribedChannels.push(item.channelId);
                            });
                        },
                        (err) => {
                            console.log(err.toString());
                        }
                    );
            },
            (err) => {
                console.log(err);
            }
        );
    }

    sendQuery() {
        for (let i in this.channels) {
            if (this.channels[i][CHANNEL_NAME].includes(this.search.toString())) {
                this.channels[i][FILTERED] = false;
            } else {
                this.channels[i][FILTERED] = true;
            }
        }
    }

    onKey($event: Event) {
        //set search value as whatever is entered on search bar every keystroke
        this.search = ($event.target as HTMLInputElement).value;

        this.sendQuery();
    }

    getChannels(): void {
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

    joinChannel(channel: ChannelObject) {
        this.subscribedChannels.push(channel.channelId);

        this.auth.getCurrentSessionId().subscribe(
            (data) => {
                let httpHeaders = {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + data.getJwtToken()
                    })
                };

                console.log(this.currentUserProfile.profileImage);

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

                // TODO: check for errors in response
                this.http
                    .post(this.channelsAPI + channel.channelId + Constants.USERS_PATH, user, httpHeaders)
                    .subscribe(
                        () => {
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
}
