import { Component, OnInit, Input, HostListener } from '@angular/core';
import {SidebarComponent} from '../sidebar/sidebar.component';
import {Directive} from '@angular/core';
@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
