import cors from "cors";
import express from "express";
import cspComponent from "./config/csp-component";
import routes from "./routes";
import { MessageDAO } from "./routes/messages/MessageDAO";
import aws from "aws-sdk";
import { awsConfigPath } from "./config/aws-config";
import { NotificationsDAO } from "./routes/notifications/NotificationsDAO";
import { uuid } from "uuidv4";
import { UserChannelDAO } from "./routes/userChannels/UserChannelDAO";
import { ReactionsDAO } from "./routes/reactions/ReactionsDAO";
import sanitize from "sanitize-html";
import {
    Constants,
    DEFAULT_PORT,
    FriendTaglineUpdateEventObject,
    IO_ACCEPTED_ORIGINS,
    Message,
    NotificationObject,
    NotificationSocketObject,
    ReactionSocketObject,
    UserChannelObject,
    UserSocket
} from "./config/app-config";
import {
    CONNECTION_EVENT,
    DISALLOWED_TAGS_MODE,
    DISCONNECT_EVENT,
    EXIT_EVENT,
    FRIEND_TAGLINE_UPDATE_BROADCAST_EVENT,
    FRIEND_TAGLINE_UPDATE_EVENT,
    KICK_EVENT,
    MESSAGE_BROADCAST_EVENT,
    MESSAGE_EVENT,
    MESSAGE_INSERT_TIME_INDEX,
    MESSAGE_MESSAGE_ID_INDEX,
    MESSAGE_NOTIFICATION_BROADCAST_EVENT,
    NOTIFICATION_BROADCAST_EVENT,
    NOTIFICATION_EVENT,
    NOTIFICATION_TYPE_MESSAGE,
    REACTION_ADD_BROADCAST_EVENT,
    REACTION_ADD_EVENT,
    REACTION_REMOVE_BROADCAST_EVENT,
    REACTION_REMOVE_EVENT,
    USER_BANNED_BROADCAST_EVENT,
    USER_BANNED_EVENT,
    USER_LEFT_CHANNEL_BROADCAST_EVENT,
    USER_LEFT_CHANNEL_EVENT,
    USER_SUBBED_CHANNEL_BROADCAST_EVENT,
    USER_SUBBED_CHANNEL_EVENT,
    USER_UNBANNED_EVENT,
    USER_UNKICK_EVENT,
    USERLIST_EVENT,
    USERNAME_EVENT
} from "./Index_Constants";
import socket = require("socket.io");

const app = express();
const port = DEFAULT_PORT;

aws.config.loadFromPath(awsConfigPath);
const docClient = new aws.DynamoDB.DocumentClient();

const server = app.listen(port, () => {
    console.log(`server started at :${port}`);
});

const io = socket.listen(server);

app.use(cspComponent);

app.use(cors());

app.get(Constants.ROOT_DIR, (req, res) => {
    res.send("Backend is up and running");
});

const users: Array<UserSocket> = [];

const notificationsDAO: NotificationsDAO = new NotificationsDAO(docClient);

app.use(Constants.ROOT_DIR, routes);
io.origins(IO_ACCEPTED_ORIGINS);
io.on(CONNECTION_EVENT, (socketIO) => {
    socketIO.on(MESSAGE_EVENT, (message: Message) => {
        if (message.content) {
            message.content = sanitizeInput(message.content);
            if (message.content == null || message.content == Constants.EMPTY) {
                message.content = Constants.SPACE;
            }
            message.profileImage = sanitizeInput(message.profileImage);
            if (message.profileImage == null || message.profileImage == Constants.EMPTY) {
                message.profileImage = Constants.SPACE;
            }
            message.username = sanitizeInput(message.username);
            if (message.channelType == null || message.channelType == Constants.EMPTY) {
                message.channelType = Constants.SPACE;
            }
            message.channelType = sanitizeInput(message.channelType);
            if (message.username == null || message.username == Constants.EMPTY) {
                message.username = Constants.SPACE;
            }
            message[MESSAGE_INSERT_TIME_INDEX] = Date.now();
            message[MESSAGE_MESSAGE_ID_INDEX] = uuid();
            io.sockets.emit(MESSAGE_BROADCAST_EVENT, message);

            let messageNotification: NotificationObject = {
                channelId: message.channelId,
                type: NOTIFICATION_TYPE_MESSAGE,
                notificationId: uuid(),
                insertedTime: Date.now(),
                channelType: message.channelType,
                username: null,
                fromFriend: message.username
            };

            for (let user of users) {
                if (user.username != message.username) {
                    messageNotification.username = user.username;
                    socketIO.broadcast.to(user.id).emit(MESSAGE_NOTIFICATION_BROADCAST_EVENT, messageNotification);
                }
            }

            let userChannelDAO: UserChannelDAO = new UserChannelDAO(docClient);
            userChannelDAO
                .getAllSubscribedUsers(message.channelId)
                .then((data: Array<UserChannelObject>) => {
                    for (let i = 0; i < data.length; i++) {
                        if (data[i].username != message.username) {
                            let messageNotification: NotificationObject = {
                                channelId: message.channelId,
                                type: NOTIFICATION_TYPE_MESSAGE,
                                notificationId: uuid(),
                                insertedTime: Date.now(),
                                channelType: message.channelType,
                                username: data[i].username,
                                fromFriend: message.username
                            };
                            let notificationsDAO: NotificationsDAO = new NotificationsDAO(docClient);
                            notificationsDAO.createNewNotification(messageNotification).catch((err) => {
                                console.error(err);
                            });
                        }
                    }
                })
                .catch((err) => {
                    console.error(err);
                });

            const messageDAO = new MessageDAO(docClient);
            messageDAO.addNewMessage(message);
        }
    });

    socketIO.on(USERNAME_EVENT, (user: UserSocket) => {
        addUser(user, socketIO.id);
        io.sockets.emit(USERLIST_EVENT, users);
    });

    socketIO.on(NOTIFICATION_EVENT, (notificationSocketObject: NotificationSocketObject) => {
        notificationSocketObject.notification.notificationId = uuid();
        notificationSocketObject.notification.insertedTime = Date.now();
        notificationSocketObject.notification.message = sanitizeInput(notificationSocketObject.notification.message);
        notificationSocketObject.notification.username = sanitizeInput(notificationSocketObject.notification.username);
        notificationSocketObject.notification.channelType = sanitizeInput(
            notificationSocketObject.notification.channelType
        );
        notificationSocketObject.notification.channelName = sanitizeInput(
            notificationSocketObject.notification.channelName
        );
        if (notificationSocketObject.notification.fromFriend == null)
            notificationSocketObject.notification.fromFriend = Constants.PERCENT;
        if (notificationSocketObject.toUser != null) {
            socketIO.broadcast
                .to(notificationSocketObject.toUser.id)
                .emit(NOTIFICATION_BROADCAST_EVENT, notificationSocketObject);
        }
        notificationsDAO.socketCreateNewNotification(notificationSocketObject).catch((err) => {
            console.error(err);
        });
    });

    socketIO.on(REACTION_ADD_EVENT, (reaction: ReactionSocketObject) => {
        let reactionsDAO: ReactionsDAO = new ReactionsDAO(docClient);
        reaction.username = sanitizeInput(reaction.username);
        reaction.emoji = sanitizeInput(reaction.emoji);
        reaction.messageId = sanitizeInput(reaction.messageId);
        io.sockets.emit(REACTION_ADD_BROADCAST_EVENT, reaction);
        reactionsDAO.addNewReaction(reaction.messageId, reaction.emoji, reaction.username).catch((err) => {
            console.error(err);
        });
    });

    socketIO.on(REACTION_REMOVE_EVENT, (reaction: ReactionSocketObject) => {
        let reactionsDAO: ReactionsDAO = new ReactionsDAO(docClient);
        reaction.username = sanitizeInput(reaction.username);
        reaction.emoji = sanitizeInput(reaction.emoji);
        reaction.messageId = sanitizeInput(reaction.messageId);
        io.sockets.emit(REACTION_REMOVE_BROADCAST_EVENT, reaction);
        reactionsDAO.deleteReactionForMessage(reaction.messageId, reaction.emoji, reaction.username).catch((err) => {
            console.error(err);
        });
    });

    socketIO.on(USER_BANNED_EVENT, (user: UserChannelObject) => {
        for (let socketUser of users) {
            if (socketUser.username == user.username) {
                socketIO.broadcast.to(socketUser.id).emit(KICK_EVENT, user);
            }
            socketIO.broadcast.to(socketUser.id).emit(USER_BANNED_BROADCAST_EVENT);
        }
    });

    socketIO.on(USER_UNBANNED_EVENT, (user: UserChannelObject) => {
        for (let socketUser of users) {
            if (socketUser.username == user.username) {
                socketIO.broadcast.to(socketUser.id).emit(USER_UNKICK_EVENT, user);
            }
            socketIO.broadcast.to(socketUser.id).emit(USER_BANNED_BROADCAST_EVENT);
        }
    });

    socketIO.on(USER_SUBBED_CHANNEL_EVENT, (user) => {
        for (let socketUser of users) {
            socketIO.broadcast.to(socketUser.id).emit(USER_SUBBED_CHANNEL_BROADCAST_EVENT, user);
        }
    });

    socketIO.on(USER_LEFT_CHANNEL_EVENT, (user) => {
        for (let socketUser of users) {
            socketIO.broadcast.to(socketUser.id).emit(USER_LEFT_CHANNEL_BROADCAST_EVENT, user);
        }
    });

    socketIO.on(FRIEND_TAGLINE_UPDATE_EVENT, (friend: FriendTaglineUpdateEventObject) => {
        for (let socketUser of users) {
            if (socketUser.username == friend.username) {
                socketIO.broadcast.to(socketUser.id).emit(FRIEND_TAGLINE_UPDATE_BROADCAST_EVENT, friend);
            }
        }
    });

    socketIO.on(EXIT_EVENT, (username: string) => {
        for (let i = 0; i < users.length; i++) {
            if (users[i].username === username) {
                users.splice(i, 1);
                io.sockets.emit(USERLIST_EVENT, users);
            }
        }
    });

    socketIO.on(DISCONNECT_EVENT, () => {
        removeUser(socketIO.id);
        io.sockets.emit(USERLIST_EVENT, users);
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
        disallowedTagsMode: DISALLOWED_TAGS_MODE
    });
    if (text === null || text === Constants.NULL) {
        return Constants.EMPTY;
    }
    return text;
}
