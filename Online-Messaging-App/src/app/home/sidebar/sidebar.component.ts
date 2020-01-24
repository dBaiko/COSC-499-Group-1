import {Component, OnInit} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
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
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

    publicChannelSelect: boolean = true;
    privateChannelSelect: boolean = false;
    friendChannelSelect: boolean = false;
    list;
    private url: string = APIConfig.GetChannelsAPI;
    constructor(private http: HttpClient) {
    }

    ngOnInit(): void {
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
    joinChannel(username: string, userId: number, channelName: string, channelId: number): Promise<Object> {
        let user: User = {
            username: username,
            userId: userId
        };
        let channel: Channel = {
            channelId : channelId,
            channelName: channelName
        };

        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http.post(this.url, user, httpOptions).toPromise();// TODO: check for errors in responce
    }
}
