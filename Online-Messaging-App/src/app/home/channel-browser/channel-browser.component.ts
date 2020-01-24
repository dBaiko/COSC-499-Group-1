import {Component, OnInit} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {AuthenticationService} from "../../shared/authentication.service";
import {APIConfig} from "../../shared/app-config";


interface User {
    username: string;
    userId: number;
}
interface Channel {
    channelName: string;
    channelId: number;
}
@Component({
    selector: 'app-channel-browser',
    templateUrl: './channel-browser.component.html',
    styleUrls: ['./channel-browser.component.scss'],
})
export class ChannelBrowserComponent implements OnInit {
    // channels = [1, 2, 3, 4, 5, 6, 7];

    channels;

    search = "";

    private url = APIConfig.GetChannelsAPI;
    private url2 = APIConfig.GetSubscribedChannelAPI;

    constructor(private http: HttpClient, private auth: AuthenticationService) {
    }

    ngOnInit() {
        this.getChannels();
    }

    sendQuery() {
        for (let i in this.channels) {
            if (this.channels[i]["channelName"].includes(this.search.toString())) {
                this.channels[i]["filtered"] = false;
            } else {
                this.channels[i]["filtered"] = true;
            }
            //console.log(this.channels[i]);
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
                'Content-Type': 'application/json'
            })
        };
        this.http.get(this.url, httpOptions).subscribe((data) => {
                this.channels = data;
            },
            err => {
                console.log(err);
            });
    }
    //TODO fix joinChannel: figure out how to get channel information
    joinChannel(channelName: string): Promise<Object> {
        let user: User = {
            username: this.auth.getAuthenticatedUser().getUsername(),
            userId: 0
        };
        let channel: Channel = {
            channelName: channelName,
            channelId: 0
        };

        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http.post(this.url2, user, channel, httpOptions).toPromise();// TODO: check for errors in responce
    }

}
