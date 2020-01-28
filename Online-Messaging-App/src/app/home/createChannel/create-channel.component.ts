import { Component, OnInit } from '@angular/core';
import {FormGroup} from "@angular/forms";
import {APIConfig} from "../../shared/app-config";

@Component({
  selector: 'app-create-channel',
  templateUrl: './create-channel.component.html',
  styleUrls: ['./create-channel.component.scss']
})
export class CreateChannelComponent implements OnInit {
    registerForm: FormGroup;
    submitAttempt: boolean = false;
    private url: string = APIConfig.RegisterAPI;


  constructor() { }

  ngOnInit() {
  }

}
