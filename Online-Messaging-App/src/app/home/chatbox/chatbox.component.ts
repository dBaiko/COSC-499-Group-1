import {Component, OnInit, Input} from '@angular/core';
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
    private _channelId;
    private _channelName;
    chatMessages;
    error: string = '';
    @Input() channelName: string;
    // TODO: Change this to actually get current channel
    private url: string = APIConfig.GetMessagesAPI;

    constructor(private messagerService: MessengerService, private http: HttpClient, private authService: AuthenticationService) {
    }

    get channelId(): any {
        return this._channelId;
    }

    @Input()
    set channelId(value: any) {
        this._channelId = value;
        this.getMessages(this._channelId);
    }

    ngOnInit(): void {
        //get old messages
        //this.getMessages();
        //subscribe to socket

        this.messagerService.subscribeToSocket().subscribe((data) => {
            this.chatMessages.push(data);

        })
    }

    getMessages(channelId: number): void {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        this.http.get(this.url+channelId, httpOptions).subscribe((data) => {
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
