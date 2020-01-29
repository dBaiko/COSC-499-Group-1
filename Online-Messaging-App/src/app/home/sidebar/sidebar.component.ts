import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {AuthenticationService} from "../../shared/authentication.service";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {APIConfig} from "../../shared/app-config";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {CreateChannelComponent} from "../createChannel/create-channel.component";

import {Constants} from "../../shared/app-config";

interface userChannelObject {
    username: string,
    channelId: string,
    userChannelRole: string,
    channelType: string,
    channelName: string
}
interface ChannelObject {
    channelId: string,
    channelName: string,
    channelType: string
}

const PRIVATE: string = "private";
const PUBLIC: string = "public";
const SELECTED: string = "selected";

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
    @Output() newChannelEvent = new EventEmitter<ChannelObject>();
    publicChannelSelect: boolean = true;
    privateChannelSelect: boolean = false;
    friendChannelSelect: boolean = false;
    list;
    private usersAPI: string = APIConfig.usersAPI;

    constructor(private http: HttpClient, private auth: AuthenticationService, private dialog: MatDialog) {
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
            if (value.channelType == PUBLIC) {
                this.publicChannels.push(value);
            } else if (value.channelType == PRIVATE) {
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
        this.http.get(this.usersAPI + this.auth.getAuthenticatedUser().getUsername() + Constants.CHANNELS_PATH, Constants.HTTP_OPTIONS).subscribe((data: Object[]) => {
                this.publicChannels = [];
                this.privateChannels = [];
                this.friendsChannels = [];
                this.userSubscribedChannels = data;
                this.userSubscribedChannels.forEach((item: userChannelObject) => {
                    if (item.channelType == PUBLIC) {
                        this.publicChannels.push(item);
                    } else if (item.channelType == PRIVATE) {
                        this.privateChannels.push(item);
                    } else {
                        this.friendsChannels.push(item);
                    }
                });
                if (this.userSubscribedChannels.length > 0) {
                    this.channelIdEvent.emit(this.userSubscribedChannels[0].channelId);
                    this.channelNameEvent.emit(this.userSubscribedChannels[0].channelName);
                    this.userSubscribedChannels[0][SELECTED] = true;
                }

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

    selectChannel(id: string) {
        this.userSubscribedChannels.forEach((item: userChannelObject) => {
            if (item.channelId == id) {
                this.channelIdEvent.emit(id.toString());
                this.channelNameEvent.emit(item.channelName);
                item[SELECTED] = true;
            } else {
                item[SELECTED] = false;
            }
        })

    }

    joinChannel():void{
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.width = "35%";
        let dialogRef = this.dialog.open(CreateChannelComponent,dialogConfig);
        dialogRef.afterClosed().subscribe((result) => {
            if(result){
                this.newChannelEvent.emit(result);
                this.userSubscribedChannels.push(result);
                if (result.channelType == PUBLIC) {
                    this.publicChannels.push(result);
                } else if (result.channelType == PRIVATE) {
                    this.privateChannels.push(result);
                } else {
                    this.friendsChannels.push(result);
                }
            }
        })
    }
}
