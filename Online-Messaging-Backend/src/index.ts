import cors from "cors";
import express from "express";
import http = require("http");
import socket = require("socket.io");
import cspComponent from "./config/csp-component";
import routes from "./routes";

const io = socket(http);
const app = express();
const port = 8080; // default port to listen

app.use(cspComponent);

app.use(cors());

app.get("/", (req, res, next) => {
    res.send("Backend is up and running");
});

app.use("/", routes);
 io.on("connection", (socketIO) => {
     // tslint:disable-next-line:no-console
     console.log("a user connected");
     socketIO.on("message", (message: any) => {
         // tslint:disable-next-line:no-console
         console.log(message);
         // pass to db
         // call from db? ~for synchronization
         socketIO.emit("message", message);
     });
 });

app.listen( port, () => {
    // tslint:disable-next-line:no-console
    console.log( `server started at http://localhost:${ port }` );
});
