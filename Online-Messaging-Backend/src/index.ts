import cors from "cors";
import express from "express";
import cspComponent from "./config/csp-component";
import routes from "./routes";
import MessageDAO, { Message } from "./routes/messages/MessageDAO";
import aws from "aws-sdk";
import { awsConfigPath } from "./config/aws-config";
import { NotificationsDAO } from "./routes/notifications/NotificationsDAO";
import { uuid } from "uuidv4";
import socket = require("socket.io");

export interface UserSocket {
    id: string;
    username: string;
}

export interface NotificationObject {
    channelId: string;
    channelName: string;
    channelType: string;
    message: string;
    type: string;
    username: string;
    notificationId: string;
    insertedTime: number;
    fromFriend: string;
}

export interface NotificationSocketObject {
    fromUser: UserSocket;
    toUser: UserSocket;
    notification: NotificationObject;
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
io.origins("http://localhost:4200");
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
                channelName: undefined,
                channelType: undefined,
                message: undefined,
                username: undefined,
                fromFriend: undefined
            };

            io.sockets.emit("messageNotificationBroadcast", messageNotification);

            let notificationsDAO: NotificationsDAO = new NotificationsDAO(docClient);
            notificationsDAO.createNewNotification(messageNotification);

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
            socketIO.broadcast
                .to(notificationSocketObject.toUser.id)
                .emit("broadcastNotification", notificationSocketObject);
        }
        notificationsDAO.socketCreateNewNotification(notificationSocketObject);
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
