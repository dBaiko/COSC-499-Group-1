import {Component, OnInit} from '@angular/core';
import {MessagerService, ChatMessage} from "../../shared/messager.service";
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {APIConfig} from "../../shared/app-config";

interface ChatMessages {
  [index: number]: ChatMessage;
}

@Component({
  selector: 'app-chatbox',
  templateUrl: './chatbox.component.html',
  styleUrls: ['./chatbox.component.scss']
})
export class ChatboxComponent implements OnInit {

  chatMessages;

  error: string = '';

  url: string = APIConfig.GetMessagesAPI;

  constructor(private messagerService: MessagerService, private http: HttpClient) {
  }

  ngOnInit() {
    //get old messages
    this.getMessages();
    //subscribe to socket
  }

  getMessages() {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    this.http.get(this.url, httpOptions).subscribe((data) => {
      this.chatMessages = data;
  },
  err => {
    this.error = err.toString();
  });
}

}
