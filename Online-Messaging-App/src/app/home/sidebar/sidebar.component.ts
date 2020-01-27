import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
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
    selector: "app-sidebar",
    templateUrl: "./sidebar.component.html",
    styleUrls: ["./sidebar.component.scss"]
})
export class SidebarComponent implements OnInit {

    publicChannels = [];
    privateChannels = [];
    friendsChannels = [];

    userSubscribedChannels = [];


    @Output() channelNameEvent = new EventEmitter<string>();
    @Output() channelIdEvent = new EventEmitter<string>();
    publicChannelSelect: boolean = true;
    privateChannelSelect: boolean = false;
    friendChannelSelect: boolean = false;
    list;

    private usersAPI: string = APIConfig.usersAPI;

    constructor(private http: HttpClient, private auth: AuthenticationService) {
    }

    private _subbedChannel: userChannelObject;

    get subbedChannel(): userChannelObject {
        return this._subbedChannel;
    }

    @Input()
    set subbedChannel(value: userChannelObject) {
        if (value) {
            this._subbedChannel = value;
            this.userSubscribedChannels.push(value);
            if (value.channelType == "public") {
                this.publicChannels.push(value);
            } else if (value.channelType == "private") {
                this.privateChannels.push(value);
            } else {
                this.friendsChannels.push(value);
            }
        }
    }


    ngOnInit(): void {
        this.getSubscribedChannels();
    }

    getSubscribedChannels(): void {
        let httpOptions = {
            headers: new HttpHeaders({
                "Content-Type": "application/json"
            })
        };
        this.http.get(this.usersAPI + this.auth.getAuthenticatedUser().getUsername() + "/channels", httpOptions).subscribe((data: Object[]) => {
                this.publicChannels = [];
                this.privateChannels = [];
                this.friendsChannels = [];
                this.userSubscribedChannels = data;
                this.userSubscribedChannels.forEach((item: userChannelObject) => {
                    if (item.channelType == "public") {
                        this.publicChannels.push(item);
                    } else if (item.channelType == "private") {
                        this.privateChannels.push(item);
                    } else {
                        this.friendsChannels.push(item);
                    }
                });
                this.channelIdEvent.emit(this.userSubscribedChannels[0].channelId);
                this.channelNameEvent.emit(this.userSubscribedChannels[0].channelName);
                this.userSubscribedChannels[0]["selected"] = true;
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
