/* tslint:disable:no-console */
import bodyParser from "body-parser";
import express from "express";
import ChannelDAO from "./ChannelDAO";
import UserChannelDAO from "../userChannels/UserChannelDAO";
import { awsConfigPath } from "../../config/aws-config";
import MessageDAO from "../messages/MessageDAO";
import aws from "aws-sdk";
import { HTTPResponseAndToken, JwtVerificationService } from "../../shared/jwt-verification-service";
import { NotificationsDAO } from "../notifications/NotificationsDAO";

const PATH_GET_ALL_CHANNELS: string = "/";
const PATH_GET_CHANNEL_BY_ID: string = "/:channelId";
const PATH_GET_ALL_SUBSCRIBED_USERS_FOR_CHANNEL: string = "/:channelId/users";
const PATH_GET_ALL_MESSAGES_FOR_CHANNEL: string = "/:channelId/messages/";
const PATH_POST_NEW_USER_SUBSCRIPTION_TO_CHANNEL: string = "/:channelId/users";
const PATH_POST_NEW_CHANNEL: string = "/";
const PATH_PUT_CHANNEL: string = "/:channelId/";
const PATH_PUT_CHANNEL_INVITE_STATUS: string = "/:channelId/inviteStatus/:inviteStatus/";
const PATH_GET_ALL_NOTIFICATIONS_FOR_CHANNEL = "/:channelId/notifications";

const AUTH_KEY = "authorization";

const router = express.Router();

const jwtVerificationService: JwtVerificationService = JwtVerificationService.getInstance();

aws.config.loadFromPath(awsConfigPath);
const docClient = new aws.DynamoDB.DocumentClient();

router.use(bodyParser.json());

router.get(PATH_GET_ALL_CHANNELS, (req, res) => {
    let token: string = req.headers[AUTH_KEY];

    jwtVerificationService.verifyJWTToken(token).subscribe(
        (data) => {
            const channelDAO = new ChannelDAO(docClient);
            channelDAO
                .getAllChannels()
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

router.get(PATH_GET_CHANNEL_BY_ID, (req, res) => {
    let token: string = req.headers[AUTH_KEY];

    jwtVerificationService.verifyJWTToken(token).subscribe(
        (data) => {
            const channelDAO = new ChannelDAO(docClient);
            let channelIdString = req.params.channelId;
            channelDAO
                .getChannelInfo(channelIdString)
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

router.get(PATH_GET_ALL_SUBSCRIBED_USERS_FOR_CHANNEL, (req, res) => {
    let token: string = req.headers[AUTH_KEY];

    jwtVerificationService.verifyJWTToken(token).subscribe(
        (data) => {
            const userChannelDAO = new UserChannelDAO(docClient);
            let channelId = req.params.channelId;
            userChannelDAO
                .getAllSubscribedUsers(channelId)
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

router.get(PATH_GET_ALL_MESSAGES_FOR_CHANNEL, (req, res) => {
    let token: string = req.headers[AUTH_KEY];

    jwtVerificationService.verifyJWTToken(token).subscribe(
        (data) => {
            const messageDAO = new MessageDAO(docClient);
            let channelIdString = req.params.channelId;
            messageDAO
                .getMessageHistory(channelIdString)
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

router.post(PATH_POST_NEW_USER_SUBSCRIPTION_TO_CHANNEL, (req, res) => {
    let token: string = req.headers[AUTH_KEY];

    jwtVerificationService.verifyJWTToken(token).subscribe(
        (data) => {
            console.log(req.body);
            console.log(req.params.channelId);

            console.log("HERE");
            console.log(req.body.profileImage);

            const userChannelDAO = new UserChannelDAO(docClient);
            userChannelDAO
                .addNewUserToChannel(
                    req.body.username,
                    req.body.channelId,
                    req.body.userChannelRole,
                    req.body.channelName,
                    req.body.channelType,
                    req.body.profileImage
                )
                .then(() => {
                    res.status(200).send({
                        status: 200,
                        data: { message: "New userChannel added successfully" }
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

router.post(PATH_POST_NEW_CHANNEL, (req, res) => {
    let token: string = req.headers[AUTH_KEY];

    jwtVerificationService.verifyJWTToken(token).subscribe(
        (data) => {
            const channelDAO = new ChannelDAO(docClient);
            channelDAO
                .addNewChannel(
                    req.body.channelName,
                    req.body.channelType,
                    req.body.channelDescription,
                    req.body.firstUsername,
                    req.body.firstUserChannelRole,
                    req.body.inviteStatus,
                    req.body.profileImage
                )
                .then((data) => {
                    res.status(200).send({
                        status: 200,
                        data: { message: "New channel added successfully", newChannel: data }
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

router.put(PATH_PUT_CHANNEL, (req, res) => {
    let token: string = req.headers[AUTH_KEY];

    jwtVerificationService.verifyJWTToken(token).subscribe(
        (data) => {
            const channelDAO: ChannelDAO = new ChannelDAO(docClient);
            channelDAO
                .updateChannel(req.body.channelId, req.body.channelName, req.body.channelType, req.body.channelDescription)
                .then(() => {
                    console.log("Channel updated successfully");
                    res.status(200).send({
                        status: 200,
                        data: { message: "Channel for" + req.body.channelId + "updated successfully" }
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

router.put(PATH_PUT_CHANNEL_INVITE_STATUS, (req, res) => {
    let token: string = req.headers[AUTH_KEY];

    jwtVerificationService.verifyJWTToken(token).subscribe(
        (data) => {
            const channelDAO: ChannelDAO = new ChannelDAO(docClient);
            channelDAO
                .updateChannelInviteStatus(req.body.channelId, req.body.channelName, req.body.inviteStatus)
                .then(() => {
                    console.log("Channel updated successfully");
                    res.status(200).send({
                        status: 200,
                        data: { message: "Channel for" + req.body.channelId + "updated successfully" }
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

router.get(PATH_GET_ALL_NOTIFICATIONS_FOR_CHANNEL, (req, res) => {
    let token: string = req.headers[AUTH_KEY];

    jwtVerificationService.verifyJWTToken(token).subscribe(
        (data: HTTPResponseAndToken) => {
            const notificationsDAO = new NotificationsDAO(docClient);
            notificationsDAO
                .getAllNotificationsForChannel(req.params.channelId)
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
