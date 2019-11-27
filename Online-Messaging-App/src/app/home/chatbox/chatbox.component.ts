import {AfterViewChecked, AfterViewInit, Component, ElementRef, OnInit, QueryList, ViewChild} from '@angular/core';
import {MessengerService, ChatMessage} from "../../shared/messenger.service";
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
export class ChatboxComponent implements OnInit, AfterViewInit {

  container: HTMLElement;

  chatMessages;
  error: string = '';

  url: string = APIConfig.GetMessagesAPI;

  constructor(private messagerService: MessengerService, private http: HttpClient, private authService: AuthenticationService) {
  }

  ngOnInit() {
    //get old messages
    this.getMessages();
    //subscribe to socket

    this.messagerService.subscribeToSocket().subscribe((data) => {
      this.chatMessages.push(data);

    })
  }

  ngAfterViewInit(): void {
    this.container = document.getElementById('scrollable');
    this.container.scrollTop = this.container.scrollHeight;
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

  sendMessage(form) {
    let value = form.value;
    form.reset();
    console.log(value.content);
    let chatMessage = {
      username: this.authService.getAuthenticatedUser().getUsername(),
      content: value.content
    };
    this.messagerService.sendMessage(chatMessage);

  }

}
