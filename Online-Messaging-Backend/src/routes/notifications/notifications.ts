import bodyParser from "body-parser";
import express from "express";
import { awsConfigPath } from "../../config/aws-config";
import aws from "aws-sdk";
import { JwtVerificationService } from "../../shared/jwt-verification-service";
import { NotificationsDAO } from "./NotificationsDAO";
import { uuid } from "uuidv4";
import { sanitizeInput } from "../../index";
import { Constants, NotificationObject } from "../../config/app-config";
import {
    AUTH_KEY,
    NOTIFICATION_TYPE_MESSAGE,
    PATH_DELETE_ALL_MESSAGE_NOTIFICATIONS_FOR_USER_FOR_CHANNEL,
    PATH_DELETE_NOTIFICATION,
    PATH_GET_ALL_FRIEND_INVITES_FROM_USER,
    PATH_POST_NEW_NOTIFICATION
} from "./Notifications_Constants";

const router = express.Router();

const jwtVerificationService: JwtVerificationService = JwtVerificationService.getInstance();

aws.config.loadFromPath(awsConfigPath);
const docClient = new aws.DynamoDB.DocumentClient();

router.use(bodyParser.json());

router.post(PATH_POST_NEW_NOTIFICATION, (req, res) => {
    let token: string = req.headers[AUTH_KEY];

    jwtVerificationService.verifyJWTToken(token).subscribe(
        () => {
            const notificationsDAO: NotificationsDAO = new NotificationsDAO(docClient);

            let newNotification: NotificationObject = {
                channelId: sanitizeInput(req.body.channelId),
                channelName: sanitizeInput(req.body.channelName),
                channelType: sanitizeInput(req.body.channelType),
                username: sanitizeInput(req.body.username),
                message: sanitizeInput(req.body.message),
                type: sanitizeInput(req.body.type),
                fromFriend: req.body.fromFriend,
                notificationId: uuid(),
                insertedTime: Date.now()
            };

            notificationsDAO
                .createNewNotification(newNotification)
                .then(() => {
                    res.status(Constants.HTTP_OK).send({
                        status: Constants.HTTP_OK,
                        data: { message: "New notification added successfully" }
                    });
                })
                .catch((err) => {
                    console.error(err);
                    res.status(Constants.HTTP_BAD_REQUEST).send(err);
                });
        },
        (err) => {
            res.status(err.status).send(err);
        }
    );
});

router.delete(PATH_DELETE_NOTIFICATION, (req, res) => {
    let token: string = req.headers[AUTH_KEY];

    jwtVerificationService.verifyJWTToken(token).subscribe(
        () => {
            const notificationsDAO: NotificationsDAO = new NotificationsDAO(docClient);
            notificationsDAO
                .deleteNotification(req.params.notificationId, Number(req.params.insertedTime))
                .then(() => {
                    res.status(Constants.HTTP_OK).send({
                        status: Constants.HTTP_OK,
                        data: { message: "Notification deleted successfully" }
                    });
                })
                .catch((err) => {
                    res.status(Constants.HTTP_BAD_REQUEST).send(err);
                });
        },
        (err) => {
            res.status(err.status).send(err);
        }
    );
});

router.get(PATH_GET_ALL_FRIEND_INVITES_FROM_USER, (req, res) => {
    let token: string = req.headers[AUTH_KEY];

    jwtVerificationService.verifyJWTToken(token).subscribe(
        () => {
            let fromFriendParam = req.params.fromFriend;

            const notificationsDAO = new NotificationsDAO(docClient);
            notificationsDAO
                .getAllFriendRequestsFromUser(fromFriendParam)
                .then((data) => {
                    res.status(Constants.HTTP_OK).send(data);
                })
                .catch((err) => {
                    res.status(Constants.HTTP_BAD_REQUEST).send(err);
                });
        },
        (err) => {
            res.status(err.status).send(err);
        }
    );
});

router.delete(PATH_DELETE_ALL_MESSAGE_NOTIFICATIONS_FOR_USER_FOR_CHANNEL, (req, res) => {
    let token: string = req.headers[AUTH_KEY];

    jwtVerificationService.verifyJWTToken(token).subscribe(
        () => {
            let notificationsDAO = new NotificationsDAO(docClient);
            notificationsDAO
                .getAllNotificationsForChannelAtUsername(req.params.channelId, req.params.username)
                .then((data: Array<NotificationObject>) => {
                    for (let item of data) {
                        if (item.type == NOTIFICATION_TYPE_MESSAGE) {
                            notificationsDAO.deleteNotification(item.notificationId, item.insertedTime).catch((err) => {
                                console.error(err);
                            });
                        }
                    }
                    res.status(Constants.HTTP_OK).send({
                        status: Constants.HTTP_OK,
                        message: "Message notifications deleted successfully"
                    });
                })
                .catch((err) => {
                    console.error(err);
                    res.status(Constants.HTTP_BAD_REQUEST).send(err);
                });
        },
        (err) => {
            res.status(err.status).send(err);
        }
    );
});

export = router;
