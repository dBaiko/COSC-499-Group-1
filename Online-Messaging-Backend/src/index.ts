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
import socket = require("socket.io");

export interface UserSocket {
    id: string;
    username: string;
}

export interface ReactionSocketObject {
    emoji: string,
    username: string,
    messageId: string
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
io.origins("http://localhost:4200 https://streamline-athletes-messaging-app.s3.ca-central-1.amazonaws.com:* http://ec2-35-183-101-255.ca-central-1.compute.amazonaws.com:*");
io.on("connection", (socketIO) => {
    // tslint:disable-next-line:no-console
    console.log("a user connected");

    socketIO.on("message", (message: Message) => {
        if (message.content) {
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
            userChannelDAO.getAllSubscribedUsers(message.channelId)
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
        console.log(users);
        socketIO.emit("userList", users);
    });

    socketIO.on("notification", (notificationSocketObject: NotificationSocketObject) => {
        notificationSocketObject.notification.notificationId = uuid();
        notificationSocketObject.notification.insertedTime = Date.now();
        if (notificationSocketObject.notification.fromFriend == null)
            notificationSocketObject.notification.fromFriend = "%";
        console.log(users);
        if (notificationSocketObject.toUser != null) {
            console.log(notificationSocketObject);
            socketIO.broadcast
                .to(notificationSocketObject.toUser.id)
                .emit("broadcastNotification", notificationSocketObject);
        }
        notificationsDAO.socketCreateNewNotification(notificationSocketObject);
    });

    socketIO.on("reaction_add", (reaction: ReactionSocketObject) => {
        let reactionsDAO: ReactionsDAO = new ReactionsDAO(docClient);
        io.sockets.emit("broadcast_reaction_add", reaction);
        reactionsDAO.addNewReaction(reaction.messageId, reaction.emoji, reaction.username);
    });

    socketIO.on("reaction_remove", (reaction: ReactionSocketObject) => {
        let reactionsDAO: ReactionsDAO = new ReactionsDAO(docClient);
        io.sockets.emit("broadcast_reaction_remove", reaction);
        reactionsDAO.deleteReactionForMessage(reaction.messageId, reaction.emoji, reaction.username);
    });

    socketIO.on("exit", (username: string) => {
        for (let i = 0; i < users.length; i++) {
            if (users[i].username === username) {
                users.splice(i, 1);
                console.log(users);
                socketIO.emit("userList", users);
            }
        }
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
