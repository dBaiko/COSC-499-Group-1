import { AfterViewChecked, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { MessengerService } from "../../shared/messenger.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { APIConfig, Constants } from "../../shared/app-config";
import { AuthenticationService } from "../../shared/authentication.service";
import { FormGroup } from "@angular/forms";

const whitespaceRegEx: RegExp = /^\s+$/i;
const MESSAGES_URI = "/messages";

@Component({
    selector: "app-chatbox",
    templateUrl: "./chatbox.component.html",
    styleUrls: ["./chatbox.component.scss"]
})
export class ChatboxComponent implements OnInit, AfterViewChecked {
    chatMessages;
    error: string = Constants.EMPTY;

    @Input() channelName: string;
    @Output() profileViewEvent = new EventEmitter<string>();
    @ViewChild("scrollframe", { static: false }) scrollContainer: ElementRef;
    private _channelName;
    private url: string = APIConfig.channelsAPI;
    private called: boolean = true;
    private isNearBottom = false;
    private atBottom = true;

    constructor(
        private messagerService: MessengerService,
        private http: HttpClient,
        private authService: AuthenticationService
    ) {}

    private _channelId;

    get channelId(): any {
        this.scrollToBottom();
        return this._channelId;
    }

    @Input()
    set channelId(value: any) {
        this._channelId = value;
        this.getMessages(this._channelId);
        this.isNearBottom = false;
    }

    ngOnInit(): void {
        this.messagerService.subscribeToSocket().subscribe((data) => {
            if (data.channelId == this.channelId) {
                this.chatMessages.push(data);
            }
        });
    }

    ngAfterViewChecked() {
        this.scrollToBottom();
    }

    getMessages(channelId: string): void {
        this.authService.getCurrentSessionId().subscribe(
            (data) => {
                let httpHeaders = {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + data.getJwtToken()
                    })
                };

                this.http.get(this.url + channelId + MESSAGES_URI, httpHeaders).subscribe(
                    (data) => {
                        this.chatMessages = data || [];
                    },
                    (err) => {
                        this.error = err.toString();
                    }
                );
            },
            (err) => {
                console.log(err);
            }
        );
    }

    sendMessage(form: FormGroup): void {
        let value = form.value;
        if (value.content && !whitespaceRegEx.test(value.content)) {
            form.reset();
            let chatMessage = {
                channelId: this._channelId,
                username: this.authService.getAuthenticatedUser().getUsername(),
                content: value.content
            };
            this.isNearBottom = false;
            this.messagerService.sendMessage(chatMessage);
        } // TODO: add user error message if this is false
    }

    goToProfile(username: string) {
        this.profileViewEvent.emit(username);
    }

    private onScroll() {
        let element = this.scrollContainer.nativeElement;
        // using ceiling and floor here to normalize the differences in browsers way of calculating these values
        this.atBottom = Math.ceil(element.scrollHeight - element.scrollTop) === Math.floor(element.offsetHeight);
        if (this.atBottom) {
            this.isNearBottom = false;
        } else {
            this.isNearBottom = true;
        }
    }

    private scrollToBottom(): void {
        if (this.isNearBottom) {
            return;
        }
        try {
            this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
            this.isNearBottom = false;
        } catch (err) {
            console.log(err);
        }
    }
}
