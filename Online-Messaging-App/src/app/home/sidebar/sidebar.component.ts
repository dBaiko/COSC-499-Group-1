import { Component, OnInit, HostBinding } from '@angular/core';
import {FormGroup, FormBuilder} from '@angular/forms';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  opened = true;
  publicChannelSelect: boolean = true;
  privateChannelSelect: boolean = false;
  friendChannelSelect: boolean = false;

constructor(){}

  ngOnInit() {
  }
selectPublicChannel():void {
  this.publicChannelSelect = true;
  this.privateChannelSelect= false;
  this.friendChannelSelect= false;
}
selectPrivateChannel():void {
  this.publicChannelSelect = false;
  this.privateChannelSelect = true;
  this.friendChannelSelect = false;
}
selectFriend():void {
  this.publicChannelSelect = false;
  this.privateChannelSelect = false;
  this.friendChannelSelect = true;
}
}
