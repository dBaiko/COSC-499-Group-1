import { Injectable } from "@angular/core";
import * as Socket from "socket.io-client";

export interface UserSocket {
    id: string,
    username: string
}

export interface NotificationObject {
    fromUser: UserSocket,
    toUser: UserSocket,
    message: object
}

const USERNAME_EVENT = "username";
const EXIT_EVENT = "exit";
const USER_LIST_EVENT = "userList";
const NOTIFICATION_EVENT = "notification";
const BROADCAST_NOTIFICATION_EVENT = "broadcastNotification";

@Injectable()
export class NotificationService {
    private static instance: NotificationService;
    private static url = "http://localhost:8080";
    private static socket;
    private static onlineUsers: Array<UserSocket> = [];

    constructor() {
    }

    public static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;

    }

    public getSocket(): void {
        NotificationService.onlineUsers = [];
        NotificationService.socket = Socket(NotificationService.url);
        NotificationService.socket.on(USER_LIST_EVENT, (userList: Array<UserSocket>) => {
            NotificationService.onlineUsers = userList;
        });
        NotificationService.socket.on(BROADCAST_NOTIFICATION_EVENT, (newNotification: NotificationObject) => {
            console.log(newNotification);
        });
    }

    subscribeToSocket(username: string): void {
        NotificationService.socket.emit(USERNAME_EVENT, username);
    }

    sendNotification(notification: NotificationObject): void {
        NotificationService.socket.emit(NOTIFICATION_EVENT, notification);
    }

    getSocketId(): string {
        return NotificationService.socket.id;
    }

    getOnlineUserByUsername(username: string) {
        console.log(NotificationService.onlineUsers);
        for (let i = 0; i < NotificationService.onlineUsers.length; i++) {
            if (NotificationService.onlineUsers[i].username === username) {
                return NotificationService.onlineUsers[i];
            }
        }
        return null;
    }

    exitSocket(username: string) {
        NotificationService.socket.emit(EXIT_EVENT, username);
        NotificationService.socket.disconnect();
    }

}
