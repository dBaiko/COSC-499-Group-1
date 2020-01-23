import {Component, OnInit} from '@angular/core';
import {NgForm} from "@angular/forms";
import {FormGroup} from "@angular/forms";
@Component({
  selector: 'app-channel-browser',
  templateUrl: './channel-browser.component.html',
  styleUrls: ['./channel-browser.component.scss'],
})
export class ChannelBrowserComponent implements OnInit {
    channels =[1,2,3,4,5,6,7];
    search;
  constructor() { }

  ngOnInit() {

  }

    sendQuery(messageForm: NgForm) {
      //deletes the channel that matches the search criteria for now
    for (let i in this.channels) {
    if(this.channels[i].toString().includes(this.search.toString()))
        this.channels.splice(Number(i),1);
    }
    }

    onKey($event: KeyboardEvent) {
      //set search value as whatever is entered on search bar every keystroke
        this.search= ($event.target as HTMLInputElement).value;

    }
}
