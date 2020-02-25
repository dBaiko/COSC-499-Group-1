import bodyParser from "body-parser";
import express from "express";
import { awsConfigPath } from "../../config/aws-config";
import aws from "aws-sdk";
import { HTTPResponseAndToken, JwtVerificationService } from "../../shared/jwt-verification-service";
import { NotificationObject, NotificationsDAO } from "./NotificationsDAO";
import { uuid } from "uuidv4";

const PATH_POST_NEW_NOTIFICATION: string = "/";
const PATH_DELETE_NOTIFICATION: string = "/:notificationId/insertedTime/:insertedTime";
const PATH_GET_ALL_FRIEND_INVITES_FROM_USER: string = "/fromFriend/:fromFriend";

const AUTH_KEY = "authorization";

const router = express.Router();

const jwtVerificationService: JwtVerificationService = JwtVerificationService.getInstance();

aws.config.loadFromPath(awsConfigPath);
const docClient = new aws.DynamoDB.DocumentClient();

router.use(bodyParser());

router.post(PATH_POST_NEW_NOTIFICATION, (req, res) => {
    let token: string = req.headers[AUTH_KEY];

    jwtVerificationService.verifyJWTToken(token).subscribe(
        (data) => {
            const notificationsDAO: NotificationsDAO = new NotificationsDAO(docClient);

            let newNotification: NotificationObject = {
                channelId: req.body.channelId,
                channelName: req.body.channelName,
                username: req.body.username,
                message: req.body.message,
                type: req.body.type,
                notificationId: uuid(),
                insertedTime: Date.now()
            };

            notificationsDAO
                .createNewNotification(newNotification)
                .then(() => {
                    res.status(200).send({
                        status: 200,
                        data: { message: "New notification added successfully" }
                    });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(400).send(err);
                });
        },
        (err) => {
            res.status(err.status).send(err);
        }
    );
});

router.delete(PATH_DELETE_NOTIFICATION, (req, res) => {
    console.log("here");
    let token: string = req.headers[AUTH_KEY];

    jwtVerificationService.verifyJWTToken(token).subscribe(
        (data) => {
            const notificationsDAO: NotificationsDAO = new NotificationsDAO(docClient);
            notificationsDAO
                .deleteNotification(req.params.notificationId, Number(req.params.insertedTime))
                .then(() => {
                    res.status(200).send({
                        status: 200,
                        data: { message: "Notification deleted successfully" }
                    });
                })
                .catch((err) => {
                    res.status(400).send(err);
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
        (data: HTTPResponseAndToken) => {
            let fromFriendParam = req.params.fromFriend;

            const notificationsDAO = new NotificationsDAO(docClient);
            notificationsDAO
                .getAllFriendRequestsFromUser(fromFriendParam)
                .then((data) => {
                    res.status(200).send(data);
                })
                .catch((err) => {
                    res.status(400).send(err);
                });
        },
        (err) => {
            res.status(err.status).send(err);
        }
    );
});

export = router;
