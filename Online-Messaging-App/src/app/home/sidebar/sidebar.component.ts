import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {AuthenticationService} from "../../shared/authentication.service";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {APIConfig} from "../../shared/app-config";

interface userChannelObject {
    username: string,
    channelId: number,
    userChannelRole: string,
    channelType: string,
    channelName: string
}

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

    publicChannels = [];
    privateChannels = [];
    friendsChannels = [];

    userSubscribedChannels;


    @Output() channelNameEvent = new EventEmitter<string>();
    @Output() channelIdEvent = new EventEmitter<string>();
    publicChannelSelect: boolean = true;
    privateChannelSelect: boolean = false;
    friendChannelSelect: boolean = false;
    list;
    private url: string = APIConfig.GetSubscribedChannelsAPI;

    constructor(private http: HttpClient, private auth: AuthenticationService) {
    }


    ngOnInit(): void {
        this.getSubscribedChannels();
    }

    getSubscribedChannels(): void {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        this.http.get(this.url + this.auth.getAuthenticatedUser().getUsername(), httpOptions).subscribe((data: Object[]) => {
                this.userSubscribedChannels = data;
                this.userSubscribedChannels.forEach((item: userChannelObject) => {
                    if (item.channelType == "public") {
                        this.publicChannels.push(item);
                    } else if (item.channelType == "private") {
                        this.privateChannels.push(item);
                    } else {
                        this.friendsChannels.push(item);
                    }
                })
            },
            err => {
                console.log(err);
            });
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

    selectChannel(id: number) {
        this.userSubscribedChannels.forEach((item: userChannelObject) => {
            if (item.channelId == id) {
                this.channelIdEvent.emit(id.toString());
                this.channelNameEvent.emit(item.channelName);
                item["selected"] = true;
            } else {
                item["selected"] = false;
            }
        })

    }
}
