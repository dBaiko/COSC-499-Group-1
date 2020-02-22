import cors from "cors";
import express from "express";
import cspComponent from "./config/csp-component";
import routes from "./routes";
import MessageDAO from "./routes/messages/MessageDAO";
import aws from "aws-sdk";
import { awsConfigPath } from "./config/aws-config";
import socket = require("socket.io");

interface UserSocket {
    id: string,
    username: string
}

interface NotificationObject {
    fromUser: UserSocket,
    toUser: UserSocket,
    message: object
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

app.use("/", routes);
io.origins("http://localhost:4200");
io.on("connection", (socketIO) => {
    // tslint:disable-next-line:no-console
    console.log("a user connected");

    socketIO.on("message", (message: any) => {
        if (message.content) {
            io.sockets.emit("broadcast", message);
            const messageDAO = new MessageDAO(docClient);
            messageDAO.addNewMessage(message);
        }
    });

    socketIO.on("username", (username: string) => {
        console.log(username + " Added");
        users.push({
            id: socketIO.id,
            username: username
        });
        console.log(users);

        socketIO.emit("userList", users);

    });

    socketIO.on("notification", (notificationObject: NotificationObject) => {
        console.log(JSON.stringify(notificationObject, null, 4));
        socketIO.broadcast.to(notificationObject.toUser.id).emit("broadcastNotification", notificationObject);
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
