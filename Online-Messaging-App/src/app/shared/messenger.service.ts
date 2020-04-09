import { Injectable } from "@angular/core";
import * as Socket from "socket.io-client";
import { Observable } from "rxjs";

const BROADCAST: string = "broadcast";
const MESSAGE: string = "message";

export interface ChatMessage {
    channelId: string;
    username: string;
    content: string;
}

@Injectable()
export class MessengerService {
    private url = "http://ec2-35-183-101-255.ca-central-1.compute.amazonaws.com:8080";
    private socket;

    constructor() {
        this.socket = Socket(this.url);
    }

    subscribeToSocket(): Observable<any> {
        return new Observable<any>((observer) => {
            this.socket.on(BROADCAST, (data) => observer.next(data));
        });
    }

    sendMessage(chatMessage: ChatMessage) {
        this.socket.emit(MESSAGE, chatMessage);
    }
}
