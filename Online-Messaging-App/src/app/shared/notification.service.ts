import { Injectable } from "@angular/core";
import * as Socket from "socket.io-client";
import { NotificationSocketObject, ReactionSocketObject, UserSocket } from "./app-config";

const USERNAME_EVENT = "username";
const EXIT_EVENT = "exit";
const USER_LIST_EVENT = "userList";
const NOTIFICATION_EVENT = "notification";
const REACTION_ADD_EVENT = "reaction_add";
const REACTION_REMOVE_EVENT = "reaction_remove";

@Injectable()
export class NotificationService {
    private static socket;
    private static instance: NotificationService;
    private static url = "http://localhost:8080";
    private static onlineUsers: Array<UserSocket> = [];
    private static socketId: string;

    constructor() {
    }

    public static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }

    public getOnlineUsers(): Array<UserSocket> {
        return NotificationService.onlineUsers;
    }

    public getSocket(username: string): void {
        NotificationService.onlineUsers = [];
        NotificationService.socket = Socket(NotificationService.url);
        NotificationService.socket.on(USER_LIST_EVENT, (userList: Array<UserSocket>) => {
            NotificationService.onlineUsers = userList;
        });

        NotificationService.socket.on("connect", () => {
            NotificationService.socketId = NotificationService.socket.id;
            NotificationService.socket.emit(USERNAME_EVENT, {
                username: username,
                id: NotificationService.socket.id
            });
        });
    }

    sendNotification(notification: NotificationSocketObject): void {
        NotificationService.socket.emit(NOTIFICATION_EVENT, notification);
    }

    sendReaction(reaction: ReactionSocketObject): void {
        NotificationService.socket.emit(REACTION_ADD_EVENT, reaction);
    }

    removeReaction(reaction: ReactionSocketObject): void {
        NotificationService.socket.emit(REACTION_REMOVE_EVENT, reaction);
    }

    getSocketId(): string {
        return NotificationService.socket.id;
    }

    getOnlineUserByUsername(username: string): UserSocket {
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

    addSocketListener(eventName: string, callback: (sentObject: Object) => any) {
        NotificationService.socket.on(eventName, (notification: Object) => {
            callback(notification);
        });
    }
}
