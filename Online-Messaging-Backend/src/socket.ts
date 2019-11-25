//RAW socket.io backend, receives messages from frontend and echoes to all listening clients
import * as express from "express";
import * as socketio from "socket.io";
import * as path from "path";
import routes from "./routes";

const app = express();
const port = 8080;
app.set("port", process.env.PORT || port);

let http = require("http").Server(app);
let io = require("socket.io")(http);

app.get("/", (req: any, res: any) =>
{
    res.sendFile(path.resolve("./client/index.html"));
});

io.on("connection", function(socket: any)
{
    //tslint:disable-next-line:no-console
    console.log("a user connected");
    socket.on("message", function(message: any)
    {
        //tslint:disable-next-line:no-console
        console.log(message);
        //pass to db
        //call from db? ~for synchronization
        socket.emit("message", message);
    });
});

const server = http.listen(port, function()
{
    //tslint:disable-next-line:no-console
    console.log("listening on *:port");
});