/* tslint:disable:no-console */
import bodyParser from "body-parser";
import express from "express";
import ChannelDAO from "./ChannelDAO";
import UserChannelDAO from "../userChannels/UserChannelDAO";
import { awsConfigPath } from "../../config/aws-config";
import { Message, MessageDAO } from "../messages/MessageDAO";
import aws from "aws-sdk";
import { HTTPResponseAndToken, JwtVerificationService } from "../../shared/jwt-verification-service";
import { NotificationsDAO } from "../notifications/NotificationsDAO";
import { sanitizeInput } from "../../index";

const PATH_GET_ALL_CHANNELS: string = "/";
const PATH_GET_CHANNEL_BY_ID: string = "/:channelId";
const PATH_GET_ALL_SUBSCRIBED_USERS_FOR_CHANNEL: string = "/:channelId/users";
const PATH_GET_ALL_MESSAGES_FOR_CHANNEL: string = "/:channelId/messages/loadCount/:loadCount";
const PATH_POST_NEW_USER_SUBSCRIPTION_TO_CHANNEL: string = "/:channelId/users";
const PATH_POST_NEW_CHANNEL: string = "/";
const PATH_PUT_CHANNEL: string = "/:channelId/";
const PATH_PUT_CHANNEL_INVITE_STATUS: string = "/:channelId/inviteStatus/:inviteStatus/";
const PATH_GET_ALL_NOTIFICATIONS_FOR_CHANNEL = "/:channelId/notifications";
const PATH_BAN_USER = "/:channelId/users/:username/ban";
const PATH_UNBAN_USER = "/:channelId/users/:username/unban";

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
                .then((data: Array<Message>) => {
                    let loadCount: number = Number(req.params.loadCount);
                    if (loadCount === NaN || loadCount < 0) {
                        res.status(400).send("loadCount must be a positive number");
                    } else {
                        if (loadCount != 0 && data.length < 50) {
                            res.status(200).send([]);
                        } else if (data.length < 50) {
                            res.status(200).send(data);
                        } else {
                            let ret = data.splice(data.length - loadCount - 50 - 1, 50);

                            res.status(200).send(ret);
                        }
                    }
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
            const userChannelDAO = new UserChannelDAO(docClient);
            userChannelDAO
                .addNewUserToChannel(
                    req.body.username,
                    req.body.channelId,
                    req.body.userChannelRole,
                    sanitizeInput(req.body.channelName),
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
                    sanitizeInput(req.body.channelName),
                    sanitizeInput(req.body.channelType),
                    sanitizeInput(req.body.channelDescription),
                    sanitizeInput(req.body.firstUsername),
                    sanitizeInput(req.body.firstUserChannelRole),
                    sanitizeInput(req.body.inviteStatus),
                    sanitizeInput(req.body.profileImage)
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
                .updateChannel(
                    sanitizeInput(req.body.channelId),
                    sanitizeInput(req.body.channelName),
                    sanitizeInput(req.body.channelType),
                    sanitizeInput(req.body.channelDescription)
                )
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
                .updateChannelInviteStatus(
                    sanitizeInput(req.body.channelId),
                    sanitizeInput(req.body.channelName),
                    sanitizeInput(req.body.inviteStatus)
                )
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

router.put(PATH_BAN_USER, (req, res) => {
    let token: string = req.headers[AUTH_KEY];
    jwtVerificationService.verifyJWTToken(token).subscribe(
        () => {
            let userChannelDAO: UserChannelDAO = new UserChannelDAO(docClient);
            userChannelDAO
                .banUser(req.params.channelId, req.params.username)
                .then(() => {
                    res.status(200).send({
                        status: 200,
                        data: { message: "User banned successfully" }
                    });
                })
                .catch((err) => {
                    res.status(500).send(err);
                });
        },
        (err) => {
            res.status(err.status).status(err);
        }
    );
});

router.put(PATH_UNBAN_USER, (req, res) => {
    let token: string = req.headers[AUTH_KEY];
    jwtVerificationService.verifyJWTToken(token).subscribe(
        () => {
            let userChannelDAO: UserChannelDAO = new UserChannelDAO(docClient);
            userChannelDAO
                .unBanUser(req.params.channelId, req.params.username)
                .then(() => {
                    res.status(200).send({
                        status: 200,
                        data: { message: "User unbanned successfully" }
                    });
                })
                .catch((err) => {
                    res.status(500).send(err);
                });
        },
        (err) => {
            res.status(err.status).status(err);
        }
    );
});

export = router;
