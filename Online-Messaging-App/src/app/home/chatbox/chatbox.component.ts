import { Component, Input, OnInit } from "@angular/core";
import { MessengerService } from "../../shared/messenger.service";
import { HttpClient } from "@angular/common/http";
import { APIConfig, Constants } from "../../shared/app-config";
import { AuthenticationService } from "../../shared/authentication.service";
import { FormGroup } from "@angular/forms";

const whitespaceRegEx: RegExp = /^\s+$/i;

@Component({
    selector: "app-chatbox",
    templateUrl: "./chatbox.component.html",
    styleUrls: ["./chatbox.component.scss"]
})
export class ChatboxComponent implements OnInit {
    chatMessages;
    error: string = Constants.EMPTY;

    @Input() channelName: string;

    private _channelName;
    private url: string = APIConfig.channelsAPI;

    constructor(
        private messagerService: MessengerService,
        private http: HttpClient,
        private authService: AuthenticationService
    ) {}

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
        this.messagerService.subscribeToSocket().subscribe(data => {
            if (data.channelId == this.channelId) this.chatMessages.push(data);
        });
    }

    getMessages(channelId: string): void {
        this.http
            .get(this.url + channelId + "/messages", Constants.HTTP_OPTIONS)
            .subscribe(
                data => {
                    this.chatMessages = data;
                },
                err => {
                    this.error = err.toString();
                }
            );
    }

    sendMessage(form: FormGroup) {
        let value = form.value;
        if (value.content && !whitespaceRegEx.test(value.content)) {
            form.reset();
            let chatMessage = {
                channelId: this._channelId,
                username: this.authService.getAuthenticatedUser().getUsername(),
                content: value.content
            };

            this.messagerService.sendMessage(chatMessage);
        } // TODO: add user error message if this is false
    }
}
