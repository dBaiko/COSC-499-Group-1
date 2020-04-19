import bodyParser from "body-parser";
import express from "express";
import { ChannelDAO } from "./ChannelDAO";
import { UserChannelDAO } from "../userChannels/UserChannelDAO";
import { awsConfigPath } from "../../config/aws-config";
import { MessageDAO } from "../messages/MessageDAO";
import aws from "aws-sdk";
import { JwtVerificationService } from "../../shared/jwt-verification-service";
import { NotificationsDAO } from "../notifications/NotificationsDAO";
import { sanitizeInput } from "../../index";
import { Constants, Message, NotificationObject } from "../../config/app-config";
import {
    MESSAGE_LOAD_COUNT,
    PATH_BAN_USER,
    PATH_GET_ALL_CHANNELS,
    PATH_GET_ALL_MESSAGES_FOR_CHANNEL,
    PATH_GET_ALL_NOTIFICATIONS_FOR_CHANNEL,
    PATH_GET_ALL_SUBSCRIBED_USERS_FOR_CHANNEL,
    PATH_GET_CHANNEL_BY_ID,
    PATH_POST_NEW_CHANNEL,
    PATH_POST_NEW_USER_SUBSCRIPTION_TO_CHANNEL,
    PATH_PUT_CHANNEL,
    PATH_PUT_CHANNEL_INVITE_STATUS,
    PATH_UNBAN_USER
} from "./Channels_Constants";
import { AUTH_KEY } from "../users/Users_Constants";

const router = express.Router();

const jwtVerificationService: JwtVerificationService = JwtVerificationService.getInstance();

aws.config.loadFromPath(awsConfigPath);
const docClient = new aws.DynamoDB.DocumentClient();

router.use(bodyParser.json());

router.get(PATH_GET_ALL_CHANNELS, (req, res) => {
    let token: string = req.headers[AUTH_KEY];

    jwtVerificationService.verifyJWTToken(token).subscribe(
        () => {
            const channelDAO = new ChannelDAO(docClient);
            channelDAO
                .getAllChannels()
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

router.get(PATH_GET_CHANNEL_BY_ID, (req, res) => {
    let token: string = req.headers[AUTH_KEY];

    jwtVerificationService.verifyJWTToken(token).subscribe(
        () => {
            const channelDAO = new ChannelDAO(docClient);
            let channelIdString = req.params.channelId;
            channelDAO
                .getChannelInfo(channelIdString)
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

router.get(PATH_GET_ALL_SUBSCRIBED_USERS_FOR_CHANNEL, (req, res) => {
    let token: string = req.headers[AUTH_KEY];

    jwtVerificationService.verifyJWTToken(token).subscribe(
        () => {
            const userChannelDAO = new UserChannelDAO(docClient);
            let channelId = req.params.channelId;
            userChannelDAO
                .getAllSubscribedUsers(channelId)
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

router.get(PATH_GET_ALL_MESSAGES_FOR_CHANNEL, (req, res) => {
    let token: string = req.headers[AUTH_KEY];

    jwtVerificationService.verifyJWTToken(token).subscribe(
        () => {
            const messageDAO = new MessageDAO(docClient);
            let channelIdString = req.params.channelId;
            messageDAO
                .getMessageHistory(channelIdString)
                .then((data: Array<Message>) => {
                    let loadCount: number = Number(req.params.loadCount);
                    if (isNaN(loadCount) || loadCount < 0) {
                        res.status(Constants.HTTP_BAD_REQUEST).send("loadCount must be a positive number");
                    } else {
                        if (loadCount != 0 && data.length < MESSAGE_LOAD_COUNT) {
                            res.status(Constants.HTTP_OK).send([]);
                        } else if (data.length < MESSAGE_LOAD_COUNT) {
                            res.status(Constants.HTTP_OK).send(data);
                        } else {
                            let ret;
                            if (data.length - loadCount - MESSAGE_LOAD_COUNT < 0) {
                                ret = data.splice(0, data.length - loadCount);
                            } else {
                                ret = data.splice(data.length - loadCount - MESSAGE_LOAD_COUNT, MESSAGE_LOAD_COUNT);
                            }

                            res.status(Constants.HTTP_OK).send(ret);
                        }
                    }
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

router.post(PATH_POST_NEW_USER_SUBSCRIPTION_TO_CHANNEL, (req, res) => {
    let token: string = req.headers[AUTH_KEY];

    jwtVerificationService.verifyJWTToken(token).subscribe(
        () => {
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
                    res.status(Constants.HTTP_OK).send({
                        status: Constants.HTTP_OK,
                        data: { message: "New userChannel added successfully" }
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

router.post(PATH_POST_NEW_CHANNEL, (req, res) => {
    let token: string = req.headers[AUTH_KEY];

    jwtVerificationService.verifyJWTToken(token).subscribe(
        () => {
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
                    res.status(Constants.HTTP_OK).send({
                        status: Constants.HTTP_OK,
                        data: { message: "New channel added successfully", newChannel: data }
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

router.put(PATH_PUT_CHANNEL, (req, res) => {
    let token: string = req.headers[AUTH_KEY];

    jwtVerificationService.verifyJWTToken(token).subscribe(
        () => {
            const channelDAO: ChannelDAO = new ChannelDAO(docClient);
            channelDAO
                .updateChannel(
                    sanitizeInput(req.body.channelId),
                    sanitizeInput(req.body.channelName),
                    sanitizeInput(req.body.channelType),
                    sanitizeInput(req.body.channelDescription)
                )
                .then(() => {
                    res.status(Constants.HTTP_OK).send({
                        status: Constants.HTTP_OK,
                        data: { message: "Channel for" + req.body.channelId + "updated successfully" }
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

router.put(PATH_PUT_CHANNEL_INVITE_STATUS, (req, res) => {
    let token: string = req.headers[AUTH_KEY];

    jwtVerificationService.verifyJWTToken(token).subscribe(
        () => {
            const channelDAO: ChannelDAO = new ChannelDAO(docClient);
            channelDAO
                .updateChannelInviteStatus(
                    sanitizeInput(req.body.channelId),
                    sanitizeInput(req.body.channelName),
                    sanitizeInput(req.body.inviteStatus)
                )
                .then(() => {
                    res.status(Constants.HTTP_OK).send({
                        status: Constants.HTTP_OK,
                        data: { message: "Channel for" + req.body.channelId + "updated successfully" }
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

router.get(PATH_GET_ALL_NOTIFICATIONS_FOR_CHANNEL, (req, res) => {
    let token: string = req.headers[AUTH_KEY];

    jwtVerificationService.verifyJWTToken(token).subscribe(
        () => {
            const notificationsDAO = new NotificationsDAO(docClient);
            notificationsDAO
                .getAllNotificationsForChannel(req.params.channelId)
                .then((data: Array<NotificationObject>) => {
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

router.put(PATH_BAN_USER, (req, res) => {
    let token: string = req.headers[AUTH_KEY];
    jwtVerificationService.verifyJWTToken(token).subscribe(
        () => {
            let userChannelDAO: UserChannelDAO = new UserChannelDAO(docClient);
            userChannelDAO
                .banUser(req.params.channelId, req.params.username)
                .then(() => {
                    res.status(Constants.HTTP_OK).send({
                        status: Constants.HTTP_OK,
                        data: { message: "User banned successfully" }
                    });
                })
                .catch((err) => {
                    res.status(Constants.HTTP_SERVER_ERROR).send(err);
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
                    res.status(Constants.HTTP_OK).send({
                        status: Constants.HTTP_OK,
                        data: { message: "User unbanned successfully" }
                    });
                })
                .catch((err) => {
                    res.status(Constants.HTTP_SERVER_ERROR).send(err);
                });
        },
        (err) => {
            res.status(err.status).status(err);
        }
    );
});

export = router;
