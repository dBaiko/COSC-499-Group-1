import { Component, OnInit } from '@angular/core';
import {Constants} from "../../../shared/app-config";

interface friendObject {
    friendId: string;
    fUserName: string;
}

@Component({
  selector: 'app-friends-browser',
  templateUrl: './friends-browser.component.html',
  styleUrls: ['./friends-browser.component.scss']
})
export class FriendsBrowserComponent implements OnInit {
    friends: Array<friendObject> = [];
    search = Constants.EMPTY;
  constructor() { }

  ngOnInit() {
  }

    onKey($event: Event) {
        //set search value as whatever is entered on search bar every keystroke
        this.search = ($event.target as HTMLInputElement).value;

        this.sendQuery();
    }
    sendQuery() {

    }
}
