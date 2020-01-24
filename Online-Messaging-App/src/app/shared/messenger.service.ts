import {Injectable} from '@angular/core';
import * as Socket from "socket.io-client";
import {Observable} from "rxjs";

export interface ChatMessage {
    channelId: number,
    username: string,
    content: string
}

@Injectable()
export class MessengerService {
    private url = "http://localhost:8080";
    private socket;

    constructor() {
        this.socket = Socket(this.url);
    }

    subscribeToSocket(): Observable<any> {
        return new Observable<any>(observer => {
            this.socket.on('broadcast', (data) => observer.next(data));
        })
    }

    sendMessage(chatMessage: ChatMessage) {
        this.socket.emit('message', chatMessage);
    }
}
