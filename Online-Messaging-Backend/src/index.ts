import cors from "cors";
import express from "express";
import cspComponent from "./config/csp-component";
import routes from "./routes";
import MessageDAO from "./routes/messages/MessageDAO";
import aws from "aws-sdk";
import { awsConfigPath } from "./config/aws-config";
import socket = require("socket.io");

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
});
