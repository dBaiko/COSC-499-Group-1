import {AfterViewChecked, AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild} from "@angular/core";
import {MessengerService} from "../../shared/messenger.service";
import {HttpClient} from "@angular/common/http";
import {APIConfig, Constants} from "../../shared/app-config";
import {AuthenticationService} from "../../shared/authentication.service";
import {FormGroup} from "@angular/forms";

const whitespaceRegEx: RegExp = /^\s+$/i;

@Component({
    selector: "app-chatbox",
    templateUrl: "./chatbox.component.html",
    styleUrls: ["./chatbox.component.scss"]
})
export class ChatboxComponent implements OnInit, AfterViewChecked,AfterViewInit {

    chatMessages;
    error: string = Constants.EMPTY;

    @Input() channelName: string;
    @ViewChild('scrollframe', {static: false}) scrollContainer: ElementRef;
    private _channelName;
    private url: string = APIConfig.channelsAPI;
    private called: boolean = true;
    private isNearBottom = false;
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
    }

    ngOnInit(): void {
        this.messagerService.subscribeToSocket().subscribe((data) => {
            if (data.channelId == this.channelId) this.chatMessages.push(data);
            console.log("sub");

        });

    }

    ngAfterViewChecked() {
        // console.log("checked");
        //     console.log('here');
            this.scrollToBottom();

            // this.scrollToBottom();
            // this.called = false;
    }
    ngAfterViewInit(): void {
        // this.scrollToBottom();
    }


    getMessages(channelId: string): void {
        this.http.get(this.url + channelId + "/messages", Constants.HTTP_OPTIONS).subscribe(
            (data) => {
                this.chatMessages = data || [];
            },
            (err) => {
                this.error = err.toString();
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
    private onScroll() {
        let element = this.scrollContainer.nativeElement;
        let atBottom = element.scrollHeight - element.scrollTop === element.clientHeight;
        console.log(atBottom);
        if (atBottom)  {
            this.isNearBottom = false
        } else {
            this.isNearBottom= true
        }
    }

    private scrollToBottom(): void {
        try {

            if (this.isNearBottom) {
                return
            }
            try {
                this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
                this.isNearBottom=false;
            } catch(err) { }
            // this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
        }catch (err){
            console.log(err);
        }
    }



}
