import {Component, OnInit} from '@angular/core';
import {ChatMessage, MessengerService} from "../../shared/messenger.service";
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {APIConfig} from "../../shared/app-config";
import {AuthenticationService} from "../../shared/authentication.service";
import {FormGroup} from "@angular/forms";

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

    // TODO: Change this to actually get current channel
    private url: string = APIConfig.GetMessagesAPI + 0;

    constructor(private messagerService: MessengerService, private http: HttpClient, private authService: AuthenticationService) {
    }

    ngOnInit(): void {
        //get old messages
        this.getMessages();
        //subscribe to socket

        this.messagerService.subscribeToSocket().subscribe((data) => {
            this.chatMessages.push(data);

        })
    }

    getMessages(): void {
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

    sendMessage(form: FormGroup) {
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
