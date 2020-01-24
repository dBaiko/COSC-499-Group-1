import {Component, OnInit} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {AuthenticationService} from "../../shared/authentication.service";
import {APIConfig} from "../../shared/app-config";
import {equal} from "assert";


interface userChannelObject {
    username: string;
    channelId: number;
    userChannelRole: string;
}

@Component({
    selector: 'app-channel-browser',
    templateUrl: './channel-browser.component.html',
    styleUrls: ['./channel-browser.component.scss'],
})
export class ChannelBrowserComponent implements OnInit {
    // channels = [1, 2, 3, 4, 5, 6, 7];
    subscribedChannels: number[] = [];
    channels;

    search = "";

    private getChannelsAPI = APIConfig.GetChannelsAPI;
    private getUserChannelsAPI = APIConfig.GetUserChannelsAPI;
    private getSubscribedChannelsAPI = APIConfig.GetSubscribedChannelsAPI;

    constructor(private http: HttpClient, private auth: AuthenticationService) {
    }

    ngOnInit() {
        this.getChannels();
        this.getSubscribedChannels();

    }

    getSubscribedChannels() {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        this.http.get(this.getSubscribedChannelsAPI + this.auth.getAuthenticatedUser().getUsername(), httpOptions).subscribe((data: Object[]) => {
                data.forEach((item: userChannelObject) => {
                    this.subscribedChannels.push(item.channelId);
                });
                console.log(this.subscribedChannels);
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
        this.http.get(this.getChannelsAPI, httpOptions).subscribe((data) => {
                this.channels = data;
            },
            err => {
                console.log(err);
            });
    }

    //TODO fix joinChannel: figure out how to get channel information
    joinChannel(channelId: number): Promise<Object> {
        let user: userChannelObject = {
            username: this.auth.getAuthenticatedUser().getUsername(),
            channelId: channelId,
            userChannelRole: "user"
        };


        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http.post(this.getUserChannelsAPI, user, httpOptions).toPromise();// TODO: check for errors in responce
    }

}
