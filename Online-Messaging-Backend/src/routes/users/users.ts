import bodyParser from "body-parser";
import express from "express";
import UserDAO from "./UserDAO";
import UserChannelDAO from "../userChannels/UserChannelDAO";
import aws from "aws-sdk";
import { awsConfigPath } from "../../config/aws-config";
import { HTTPResponseAndToken, JwtVerificationService } from "../../shared/jwt-verification-service";
import ProfileDAO from "../profiles/ProfileDAO";
import { NotificationsDAO } from "../notifications/NotificationsDAO";

const router = express.Router();

const PATH_GET_ALL_SUBSCRIBED_CHANNELS_BY_USERNAME = "/:username/channels";
const PATH_DELETE_USER_SUBSCRIPTION = "/:username/channels/:channelId";
const PATH_POST_NEW_USER = "/";
const PATH_GET_ALL_USERS = "/";
const PATH_PUT_USER = "/:username";
const PATH_GET_USER_BY_USERNAME = "/:username";
const PATH_GET_ALL_NOTIFICATIONS_FOR_USER = "/:username/notifications";
const PATH_GET_ALL_FRIEND_INVITES_FOR_USER = "/:username/notifications/fromFriend/:fromFriend";
const AUTH_KEY = "authorization";
const COGNITO_USERNAME = "cognito:username";

const jwtVerificationService: JwtVerificationService = JwtVerificationService.getInstance();

aws.config.loadFromPath(awsConfigPath);
const docClient = new aws.DynamoDB.DocumentClient();

router.use(bodyParser());

interface UserObject {
    username: string;
    email: string;
}

router.post(PATH_POST_NEW_USER, (req, res) => {
    const userRegistration = new UserDAO(docClient);
    userRegistration
        .createNewUser(req.body.username, req.body.email)
        .then(() => {
            const profileDAO: ProfileDAO = new ProfileDAO(docClient);
            profileDAO
                .createProfile(req.body.username, req.body.firstName, req.body.lastName)
                .then(() => {
                    res.status(200).send({ status: 200, data: { message: "New user added successfully" } });
                })
                .catch((err) => {
                    res.status(400).send(err);
                });
        })
        .catch((err) => {
            res.status(400).send(err);
        });
});

router.get(PATH_GET_ALL_SUBSCRIBED_CHANNELS_BY_USERNAME, (req, res) => {
    let token: string = req.headers[AUTH_KEY];

    jwtVerificationService.verifyJWTToken(token).subscribe(
        (data) => {
            const userChannelDAO = new UserChannelDAO(docClient);
            let username = req.params.username;
            userChannelDAO
                .getAllSubscribedChannels(username)
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

router.get(PATH_GET_USER_BY_USERNAME, (req, res) => {
    let token: string = req.headers[AUTH_KEY];

    jwtVerificationService.verifyJWTToken(token).subscribe(
        (data: HTTPResponseAndToken) => {
            const userDAO = new UserDAO(docClient);

            let username = req.params.username;

            if (username === data.decodedToken[COGNITO_USERNAME]) {
                userDAO
                    .getUserInfoByUsername(username)
                    .then((data: Array<UserObject>) => {
                        res.status(200).send(data);
                    })
                    .catch((err) => {
                        res.status(400).send(err);
                    });
            } else {
                res.status(401).send({
                    status: 401,
                    data: { message: "Unauthorized to access user info" }
                });
            }
        },
        (err) => {
            res.status(err.status).send(err);
        }
    );
});

router.put(PATH_PUT_USER, (req, res) => {
    let token: string = req.headers[AUTH_KEY];

    jwtVerificationService.verifyJWTToken(token).subscribe(
        (data: HTTPResponseAndToken) => {
            let usernameParam = req.params.username;

            if (
                usernameParam === data.decodedToken[COGNITO_USERNAME] &&
                req.body.username === data.decodedToken[COGNITO_USERNAME]
            ) {
                const userDAO = new UserDAO(docClient);
                userDAO
                    .updateUser(req.body.username, req.body.email)
                    .then(() => {
                        res.status(200).send({
                            status: 200,
                            data: { message: "User " + req.body.username + " updated successfully" }
                        });
                    })
                    .catch((err) => {
                        res.status(400).send(err);
                    });
            } else {
                res.status(401).send({
                    status: 401,
                    data: { message: "Unauthorized to access user info" }
                });
            }
        },
        (err) => {
            res.status(err.status).send(err);
        }
    );
});

router.get(PATH_GET_ALL_NOTIFICATIONS_FOR_USER, (req, res) => {
    let token: string = req.headers[AUTH_KEY];

    jwtVerificationService.verifyJWTToken(token).subscribe(
        (data: HTTPResponseAndToken) => {
            let usernameParam = req.params.username;

            if (usernameParam === data.decodedToken[COGNITO_USERNAME]) {
                const notificationsDAO = new NotificationsDAO(docClient);
                notificationsDAO
                    .getAllNotificationsForUser(req.params.username)
                    .then((data) => {
                        res.status(200).send(data);
                    })
                    .catch((err) => {
                        res.status(400).send(err);
                    });
            } else {
                res.status(401).send({
                    status: 401,
                    data: { message: "Unauthorized to access user info" }
                });
            }
        },
        (err) => {
            res.status(err.status).send(err);
        }
    );
});

router.get(PATH_GET_ALL_USERS, (req, res) => {
    let token: string = req.headers[AUTH_KEY];

    jwtVerificationService.verifyJWTToken(token).subscribe(
        (data: HTTPResponseAndToken) => {
            const usersDAO = new UserDAO(docClient);
            usersDAO
                .getAllUsers()
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

router.delete(PATH_DELETE_USER_SUBSCRIPTION, (req, res) => {
    let token: string = req.headers[AUTH_KEY];

    jwtVerificationService.verifyJWTToken(token).subscribe(
        (data: HTTPResponseAndToken) => {
            let userChannelDAO = new UserChannelDAO(docClient);
            userChannelDAO.deleteChannelSubscription(req.params.username, req.params.channelId)
                .then(() => {
                    res.status(200).send({
                        status: 200,
                        data: {
                            message: "User subscription deleted successfully"
                        }
                    });
                })
                .catch((err) => {
                    res.status(500).send(err);
                });
        },
        (err) => {
            res.status(err.status).send(err);
        }
    );
});

export = router;
