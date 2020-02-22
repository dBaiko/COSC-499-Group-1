import bodyParser from "body-parser";
import express from "express";
import { awsConfigPath } from "../../config/aws-config";
import aws from "aws-sdk";
import { JwtVerificationService } from "../../shared/jwt-verification-service";
import { NotificationObject, NotificationsDAO } from "./NotificationsDAO";

const PATH_POST_NEW_NOTIFICATION: string = "/";
const PATH_DELETE_NOTIFICATION: string = "/:notificationId";


const AUTH_KEY = "authorization";

const router = express.Router();

const jwtVerificationService: JwtVerificationService = JwtVerificationService.getInstance();

aws.config.loadFromPath(awsConfigPath);
const docClient = new aws.DynamoDB.DocumentClient();

router.use(bodyParser());

router.post(PATH_POST_NEW_NOTIFICATION, ((req, res) => {
    let token: string = req.headers[AUTH_KEY];

    jwtVerificationService.verifyJWTToken(token).subscribe(
        (data) => {

            const notificationsDAO: NotificationsDAO = new NotificationsDAO(docClient);

            let newNotification: NotificationObject = {
                notificationId: null,
                channelId: req.body.channelId,
                channelName: req.body.channelName,
                username: req.body.username,
                message: req.body.message,
                insertedTime: null,
                type: req.body.type
            };


            notificationsDAO.createNewNotification(newNotification)
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
}));

router.delete(PATH_DELETE_NOTIFICATION, ((req, res) => {
    let token: string = req.headers[AUTH_KEY];

    jwtVerificationService.verifyJWTToken(token).subscribe(
        (data) => {

            const notificationsDAO: NotificationsDAO = new NotificationsDAO(docClient);
            notificationsDAO.deleteNotification(req.params.notificationId, req.body.insertedTime)
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
}));


export = router;
