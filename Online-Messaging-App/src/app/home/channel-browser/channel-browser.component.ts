import {Component, OnInit} from '@angular/core';
import {NgForm} from "@angular/forms";
import {FormGroup} from "@angular/forms";
@Component({
  selector: 'app-channel-browser',
  templateUrl: './channel-browser.component.html',
  styleUrls: ['./channel-browser.component.scss'],
})
export class ChannelBrowserComponent implements OnInit {
    channels;
  constructor() { }

  ngOnInit() {

  }

    sendQuery(messageForm: NgForm) {

    this.channels= [1, 2, 3, 4, 5, 6];
    }
}
