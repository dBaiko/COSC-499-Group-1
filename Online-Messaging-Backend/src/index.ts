import cors from "cors";
import express from "express";
import socket = require("socket.io");
import cspComponent from "./config/csp-component";
import routes from "./routes";
import MessageHandler from "./routes/messages/MessageHandler";

const app = express();
const port = 8080; // default port to listen

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
io.origins('http://localhost:4200');
io.on("connection", (socketIO) => {
    // tslint:disable-next-line:no-console
    console.log("a user connected");
    socketIO.on("message", (message: any) => {
        // tslint:disable-next-line:no-console
        console.log(message);
        io.sockets.emit("broadcast", message);
        const messageHandler = new MessageHandler();
        messageHandler.addNewMessage(message);
        // call from db? ~for synchronization
        // socketIO.emit("broadcast", message);
    });
});
