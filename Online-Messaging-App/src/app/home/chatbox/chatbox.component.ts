import { AfterViewChecked, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { MessengerService } from "../../shared/messenger.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { APIConfig, Constants } from "../../shared/app-config";
import { AuthenticationService } from "../../shared/authentication.service";
import { FormGroup } from "@angular/forms";

const whitespaceRegEx: RegExp = /^\s+$/i;
const MESSAGES_URI = "/messages";

interface UserObject {
    username: string,
    email: string
}

@Component({
    selector: "app-chatbox",
    templateUrl: "./chatbox.component.html",
    styleUrls: ["./chatbox.component.scss"]
})
export class ChatboxComponent implements OnInit, AfterViewChecked {
    chatMessages;
    error: string = Constants.EMPTY;

    inviting: boolean = false;
    inviteSearch: string = Constants.EMPTY;

    inviteSearchList: Array<UserObject> = [];

    @Input() channelName: string;
    @Input() userList: Array<UserObject>;
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
    ) {
    }

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

    toggleInviting(): void {
        this.inviteSearchList = [];
        if (this.inviting) {
            this.inviting = false;
        } else {
            this.inviting = true;
        }
    }

    inviteFormSubmit() {
        if (this.inviteSearch == Constants.EMPTY) {
            this.inviteSearchList = [];
        } else {
            for (let i in this.userList) {
                if (this.userList[i].username.includes(this.inviteSearch)) {
                    if (this.inviteSearchList.indexOf(this.userList[i]) === -1) {
                        this.inviteSearchList.push(this.userList[i]);
                    }
                } else {
                    if (this.inviteSearchList[this.inviteSearchList.indexOf(this.userList[i])]) {
                        this.inviteSearchList.splice(this.inviteSearchList.indexOf(this.userList[i]), 1);
                    }
                }
            }
        }
    }

    onKey($event: Event) {
        //set search value as whatever is entered on search bar every keystroke
        this.inviteSearch = ($event.target as HTMLInputElement).value;

        this.inviteFormSubmit();
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
