import {Component, Input, OnInit} from '@angular/core';
import {MessengerService} from "../../shared/messenger.service";
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {APIConfig} from "../../shared/app-config";
import {AuthenticationService} from "../../shared/authentication.service";
import {FormGroup} from "@angular/forms";

@Component({
    selector: 'app-chatbox',
    templateUrl: './chatbox.component.html',
    styleUrls: ['./chatbox.component.scss']
})
export class ChatboxComponent implements OnInit {

    chatMessages;
    error: string = '';

    @Input() channelName: string;

    private _channelName;
    private url: string = APIConfig.GetMessagesAPI;

    constructor(private messagerService: MessengerService, private http: HttpClient, private authService: AuthenticationService) {
    }

    private _channelId;

    get channelId(): any {
        return this._channelId;
    }

    @Input()
    set channelId(value: any) {
        this._channelId = value;
        this.getMessages(this._channelId);
    }

    ngOnInit(): void {
        this.messagerService.subscribeToSocket().subscribe((data) => {
            console.log(data);
            if (data.channelId == this.channelId)
                this.chatMessages.push(data);

        });
    }

    getMessages(channelId: number): void {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        this.http.get(this.url + channelId, httpOptions).subscribe((data) => {
                this.chatMessages = data;
            },
            err => {
                this.error = err.toString();
            });
    }

    sendMessage(form: FormGroup) {
        let value = form.value;
        form.reset();
        let chatMessage = {
            channelId: this._channelId,
            username: this.authService.getAuthenticatedUser().getUsername(),
            content: value.content
        };

        this.messagerService.sendMessage(chatMessage);

    }

}
