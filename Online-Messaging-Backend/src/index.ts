import cors from "cors";
import express from "express";
import cspComponent from "./config/csp-component";
import routes from "./routes";
import { Message, MessageDAO } from "./routes/messages/MessageDAO";
import aws from "aws-sdk";
import { awsConfigPath } from "./config/aws-config";
import { NotificationObject, NotificationsDAO } from "./routes/notifications/NotificationsDAO";
import { uuid } from "uuidv4";
import UserChannelDAO from "./routes/userChannels/UserChannelDAO";
import ReactionsDAO from "./routes/reactions/ReactionsDAO";
import sanitize from "sanitize-html";
import socket = require("socket.io");

export interface UserSocket {
    id: string;
    username: string;
}

export interface ReactionSocketObject {
    emoji: string;
    username: string;
    messageId: string;
}

export interface NotificationSocketObject {
    fromUser: UserSocket;
    toUser: UserSocket;
    notification: NotificationObject;
}

export interface UserChannelObject {
    username?: string;
    channelId: string;
    userChannelRole?: string;
    channelName: string;
    channelType: string;
    profileImage?: string;
    statusText?: string;
    selected?: boolean;
    notificationCount?: number;
}

const app = express();
const port = 8080; // default port to listen

aws.config.loadFromPath(awsConfigPath);
const docClient = new aws.DynamoDB.DocumentClient();

const server = app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(`server started at http://localhost:${port}`);
});

const io = socket.listen(server);

app.use(cspComponent);

app.use(cors());

app.get("/", (req, res) => {
    res.send("Backend is up and running");
});

const users: Array<UserSocket> = [];

const notificationsDAO: NotificationsDAO = new NotificationsDAO(docClient);

app.use("/", routes);
io.origins(
    "http://localhost:4200 https://streamline-athletes-messaging-app.s3.ca-central-1.amazonaws.com:* http://ec2-35-183-101-255.ca-central-1.compute.amazonaws.com:*"
);
io.on("connection", (socketIO) => {
    // tslint:disable-next-line:no-console
    console.log("a user connected");

    socketIO.on("message", (message: Message) => {
        if (message.content) {
            console.log(message.content);
            message.content = sanitizeInput(message.content);
            if (message.content == null || message.content == "") {
                message.content = " ";
            }
            message.profileImage = sanitizeInput(message.profileImage);
            if (message.profileImage == null || message.profileImage == "") {
                message.profileImage = " ";
            }
            message.username = sanitizeInput(message.username);
            if (message.channelType == null || message.channelType == "") {
                message.channelType = " ";
            }
            message.channelType = sanitizeInput(message.channelType);
            if (message.username == null || message.username == "") {
                message.username = " ";
            }
            message["insertTime"] = Date.now();
            message["messageId"] = uuid();
            io.sockets.emit("broadcast", message);

            let messageNotification: NotificationObject = {
                channelId: message.channelId,
                type: "message",
                notificationId: uuid(),
                insertedTime: Date.now(),
                channelType: message.channelType,
                username: null,
                fromFriend: message.username
            };

            for (let user of users) {
                messageNotification.username = user.username;
                socketIO.broadcast.to(user.id).emit("messageNotificationBroadcast", messageNotification);
            }

            let userChannelDAO: UserChannelDAO = new UserChannelDAO(docClient);
            userChannelDAO
                .getAllSubscribedUsers(message.channelId)
                .then((data: Array<UserChannelObject>) => {
                    for (let i = 0; i < data.length; i++) {
                        let messageNotification: NotificationObject = {
                            channelId: message.channelId,
                            type: "message",
                            notificationId: uuid(),
                            insertedTime: Date.now(),
                            channelType: message.channelType,
                            username: data[i].username,
                            fromFriend: message.username
                        };
                        let notificationsDAO: NotificationsDAO = new NotificationsDAO(docClient);
                        notificationsDAO.createNewNotification(messageNotification);
                    }
                })
                .catch((err) => {
                    console.error(err);
                });

            const messageDAO = new MessageDAO(docClient);
            messageDAO.addNewMessage(message);
        }
    });

    socketIO.on("username", (user: UserSocket) => {
        addUser(user, socketIO.id);
        io.sockets.emit("userList", users);
    });

    socketIO.on("notification", (notificationSocketObject: NotificationSocketObject) => {
        notificationSocketObject.notification.notificationId = uuid();
        notificationSocketObject.notification.insertedTime = Date.now();
        notificationSocketObject.notification.message = sanitizeInput(notificationSocketObject.notification.message);
        notificationSocketObject.notification.username = sanitizeInput(notificationSocketObject.notification.username);
        notificationSocketObject.notification.channelType = sanitizeInput(notificationSocketObject.notification.channelType);
        notificationSocketObject.notification.channelName = sanitizeInput(notificationSocketObject.notification.channelName);
        if (notificationSocketObject.notification.fromFriend == null)
            notificationSocketObject.notification.fromFriend = "%";
        if (notificationSocketObject.toUser != null) {
            socketIO.broadcast
                .to(notificationSocketObject.toUser.id)
                .emit("broadcastNotification", notificationSocketObject);
        }
        notificationsDAO.socketCreateNewNotification(notificationSocketObject);
    });

    socketIO.on("reaction_add", (reaction: ReactionSocketObject) => {
        let reactionsDAO: ReactionsDAO = new ReactionsDAO(docClient);
        reaction.username = sanitizeInput(reaction.username);
        reaction.emoji = sanitizeInput(reaction.emoji);
        reaction.messageId = sanitizeInput(reaction.messageId);
        io.sockets.emit("broadcast_reaction_add", reaction);
        reactionsDAO.addNewReaction(reaction.messageId, reaction.emoji, reaction.username);
    });

    socketIO.on("reaction_remove", (reaction: ReactionSocketObject) => {
        let reactionsDAO: ReactionsDAO = new ReactionsDAO(docClient);
        reaction.username = sanitizeInput(reaction.username);
        reaction.emoji = sanitizeInput(reaction.emoji);
        reaction.messageId = sanitizeInput(reaction.messageId);
        io.sockets.emit("broadcast_reaction_remove", reaction);
        reactionsDAO.deleteReactionForMessage(reaction.messageId, reaction.emoji, reaction.username);
    });

    socketIO.on("userBanned", (user: UserChannelObject) => {
        for (let socketUser of users) {
            if (socketUser.username == user.username) {
                socketIO.broadcast.to(socketUser.id).emit("kickEvent", user);
            }
            socketIO.broadcast.to(socketUser.id).emit("ban_broadcast");
        }
    });

    socketIO.on("userUnBanned", (user: UserChannelObject) => {
        for (let socketUser of users) {
            if (socketUser.username == user.username) {
                socketIO.broadcast.to(socketUser.id).emit("unBanEvent", user);
            }
            socketIO.broadcast.to(socketUser.id).emit("ban_broadcast");
        }
    });

    socketIO.on("exit", (username: string) => {
        for (let i = 0; i < users.length; i++) {
            if (users[i].username === username) {
                users.splice(i, 1);
                io.sockets.emit("userList", users);
            }
        }
        console.log(users);
    });

    socketIO.on("disconnect", (data: any) => {
        removeUser(socketIO.id);
        io.sockets.emit("userList", users);
    });
});

function addUser(user: UserSocket, id: string): void {
    for (let i = 0; i < users.length; i++) {
        if (users[i].username == user.username) {
            users.splice(i, 1);
        }
    }
    users.push({
        username: user.username,
        id: id
    });
}

function removeUser(id: string): void {
    for (let i = 0; i < users.length; i++) {
        if (users[i].id == id) {
            users.splice(i, 1);
        }
    }
}

export function sanitizeInput(text: string): string {
    text = sanitize(text, {
        allowedTags: [],
        allowedAttributes: {},
        disallowedTagsMode: "escape"
    });
    if (text === null || text === "null") {
        return "";
    }
    return text;
}
