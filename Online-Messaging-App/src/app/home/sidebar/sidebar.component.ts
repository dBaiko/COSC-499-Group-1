import {Component, OnInit, Output, EventEmitter} from '@angular/core';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

    channelId: number = 0;
    @Output() channelEvent = new EventEmitter<string>();

    publicChannelSelect: boolean = true;
    privateChannelSelect: boolean = false;
    friendChannelSelect: boolean = false;

    channel1Select: boolean = false;
    channel2Select: boolean = false;
    channel3Select: boolean = false;
    status: boolean = true;
    status1: boolean = false;
    status2: boolean = false;

    constructor() {
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

    selectChannel1(){
        this.status = !this.status;
        this.status1 = false;
        this.status2= false;
        this.channelId = 1;
        this.channelEvent.emit(this.channelId.toString());


    }

    selectChannel2(): void {
        this.status1 = !this.status1;
        this.status = false;
        this.status2 = false;
        this.channelId = 2;
        this.channelEvent.emit(this.channelId.toString());
    }

    selectChannel3(): void {
        this.status2 = !this.status2;
        this.status1 = false;
        this.status = false;
        this.channelId = 3;
        this.channelEvent.emit(this.channelId.toString());

    }
}
