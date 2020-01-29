import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { AuthenticationService } from "../../shared/authentication.service";
import { APIConfig, Constants } from "../../shared/app-config";

interface userChannelObject {
    username: string;
    channelId: string;
    userChannelRole: string;
    channelName: string;
    channelType: string;
}

interface ChannelObject {
    channelId: string;
    channelName: string;
    channelType: string;
}

const CHANNEL_NAME: string = "channelName";
const FILTERED: string = "filtered";
const DEFAULT_CHANNEL_ROLE: string = "user";

@Component({
    selector: "app-channel-browser",
    templateUrl: "./channel-browser.component.html",
    styleUrls: ["./channel-browser.component.scss"]
})
export class ChannelBrowserComponent implements OnInit {
    subscribedChannels: string[] = [];
    channels: Object[] = [];

    search = Constants.EMPTY;

    @Output() newChannelIdEvent = new EventEmitter<userChannelObject>();

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
        this.http
            .get(
                this.usersAPI + this.auth.getAuthenticatedUser().getUsername() + Constants.CHANNELS_PATH,
                Constants.HTTP_OPTIONS
            )
            .subscribe(
                (data: Object[]) => {
                    data.forEach((item: userChannelObject) => {
                        this.subscribedChannels.push(item.channelId);
                    });
                },
                (err) => {
                    console.log(err.toString());
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
        this.http.get(this.channelsAPI, Constants.HTTP_OPTIONS).subscribe(
            (data: Object[]) => {
                this.channels = data;
            },
            (err) => {
                console.log(err);
            }
        );
    }

    joinChannel(channel: userChannelObject): Promise<Object> {
        this.subscribedChannels.push(channel.channelId);
        this.newChannelIdEvent.emit(channel);

        let user: userChannelObject = {
            username: this.auth.getAuthenticatedUser().getUsername(),
            channelId: channel.channelId,
            userChannelRole: DEFAULT_CHANNEL_ROLE,
            channelName: channel.channelName,
            channelType: channel.channelType
        };

        // TODO: check for errors in responce
        return this.http
            .post(
                this.channelsAPI + Constants.SLASH + channel.channelId + Constants.USERS_PATH,
                user,
                Constants.HTTP_OPTIONS
            )
            .toPromise();
    }
}
