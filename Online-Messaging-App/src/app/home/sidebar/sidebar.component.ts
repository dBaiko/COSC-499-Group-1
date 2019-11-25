import { Component, OnInit, HostBinding } from '@angular/core';
import {FormGroup, FormBuilder} from '@angular/forms';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
   opened = true;

constructor(){}

  ngOnInit() {
  }

}
