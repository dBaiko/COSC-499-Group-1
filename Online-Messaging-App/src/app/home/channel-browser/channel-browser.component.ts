import {Component, EventEmitter, OnInit, Output} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {AuthenticationService} from "../../shared/authentication.service";
import {APIConfig} from "../../shared/app-config";


interface userChannelObject {
    username: string;
    channelId: number;
    userChannelRole: string;
    channelName: string;
    channelType: string;
}

@Component({
    selector: "app-channel-browser",
    templateUrl: "./channel-browser.component.html",
    styleUrls: ["./channel-browser.component.scss"],
})
export class ChannelBrowserComponent implements OnInit {

    subscribedChannels: number[] = [];
    channels;

    search = "";

    @Output() newChannelIdEvent = new EventEmitter<userChannelObject>();

    private channelsAPI = APIConfig.channelsAPI;
    private usersAPI = APIConfig.usersAPI;

    constructor(private http: HttpClient, private auth: AuthenticationService) {
    }

    ngOnInit() {
        this.getChannels();
        this.getSubscribedChannels();

    }

    getSubscribedChannels() {
        let httpOptions = {
            headers: new HttpHeaders({
                "Content-Type": "application/json"
            })
        };
        this.http.get(this.usersAPI + this.auth.getAuthenticatedUser().getUsername() + "/channels", httpOptions).subscribe((data: Object[]) => {
                data.forEach((item: userChannelObject) => {
                    this.subscribedChannels.push(item.channelId);
                });
            },
            err => {
                console.log(err.toString());
            });
    }

    sendQuery() {
        for (let i in this.channels) {
            if (this.channels[i]["channelName"].includes(this.search.toString())) {
                this.channels[i]["filtered"] = false;
            } else {
                this.channels[i]["filtered"] = true;
            }
        }
    }

    onKey($event: Event) {
        //set search value as whatever is entered on search bar every keystroke
        this.search = ($event.target as HTMLInputElement).value;

        this.sendQuery();

    }

    getChannels(): void {
        let httpOptions = {
            headers: new HttpHeaders({
                "Content-Type": "application/json"
            })
        };
        this.http.get(this.channelsAPI, httpOptions).subscribe((data) => {
                this.channels = data;
            },
            err => {
                console.log(err);
            });
    }

    joinChannel(channel: userChannelObject): Promise<Object> {

        this.subscribedChannels.push(channel.channelId);
        this.newChannelIdEvent.emit(channel)

        let user: userChannelObject = {
            username: this.auth.getAuthenticatedUser().getUsername(),
            channelId: channel.channelId,
            userChannelRole: "user",
            channelName: channel.channelName,
            channelType: channel.channelType
        };

        let httpOptions = {
            headers: new HttpHeaders({
                "Content-Type": "application/json"
            })
        };

        return this.http.post(this.channelsAPI + "/" + channel.channelId + "/users", user, httpOptions).toPromise();// TODO: check for errors in responce
    }

}
