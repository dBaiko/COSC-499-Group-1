import {Component, OnInit} from '@angular/core';
import {MessagerService, ChatMessage} from "../../shared/messager.service";
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {APIConfig} from "../../shared/app-config";
import {AuthenticationService} from "../../shared/authentication.service";

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

  constructor(private messagerService: MessagerService, private http: HttpClient, private authService: AuthenticationService) {
  }

  ngOnInit() {
    //get old messages
    this.getMessages();
    //subscribe to socket
    this.messagerService.subscribeToSocket().subscribe((data) => {
      this.chatMessages.push(data);
    })
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

  sendMessage(value) {
    console.log(value.message);

    let chatMessage = {
      username: this.authService.getAuthenticatedUser().getUsername(),
      message: value.message
    };

    this.messagerService.sendMessage(chatMessage);

  }

}
