import bodyParser from "body-parser";
import express from "express";
import { UserDAO } from "./UserDAO";
import { UserChannelDAO } from "../userChannels/UserChannelDAO";
import aws from "aws-sdk";
import { awsConfigPath } from "../../config/aws-config";
import { JwtVerificationService } from "../../shared/jwt-verification-service";
import { ProfileDAO } from "../profiles/ProfileDAO";
import { SettingsDAO } from "../settings/settingsDAO";
import { NotificationsDAO } from "../notifications/NotificationsDAO";
import { sanitizeInput } from "../../index";
import { Constants, HTTPResponseAndToken, UserObject } from "../../config/app-config";
import {
    AUTH_KEY,
    COGNITO_USERNAME,
    DEFAULT_THEME,
    PATH_DELETE_USER_SUBSCRIPTION,
    PATH_GET_ALL_NOTIFICATIONS_FOR_USER,
    PATH_GET_ALL_SUBSCRIBED_CHANNELS_BY_USERNAME,
    PATH_GET_ALL_USERS,
    PATH_GET_SETTINGS_INFO_FOR_USER,
    PATH_GET_USER_BY_USERNAME,
    PATH_POST_NEW_USER,
    PATH_PUT_SETTINGS_FOR_USER,
    PATH_PUT_USER
} from "./Users_Constants";

const router = express.Router();

const jwtVerificationService: JwtVerificationService = JwtVerificationService.getInstance();

aws.config.loadFromPath(awsConfigPath);
const docClient = new aws.DynamoDB.DocumentClient();

router.use(bodyParser.json());

router.post(PATH_POST_NEW_USER, (req, res) => {
    const userRegistration = new UserDAO(docClient);
    userRegistration
        .createNewUser(sanitizeInput(req.body.username), sanitizeInput(req.body.email))
        .then(() => {
            const profileDAO: ProfileDAO = new ProfileDAO(docClient);
            profileDAO
                .createProfile(
                    sanitizeInput(req.body.username),
                    sanitizeInput(req.body.firstName),
                    sanitizeInput(req.body.lastName)
                )
                .then(() => {
                    const settingsDAO: SettingsDAO = new SettingsDAO(docClient);
                    settingsDAO
                        .createSettingsInfo(sanitizeInput(req.body.username), DEFAULT_THEME)
                        .then(() => {
                            res.status(Constants.HTTP_OK).send({
                                status: Constants.HTTP_OK,
                                data: { message: "New user added successfully" }
                            });
                        })
                        .catch((err) => {
                            res.status(Constants.HTTP_SERVER_ERROR).send(err);
                        });
                })
                .catch((err) => {
                    res.status(Constants.HTTP_SERVER_ERROR).send(err);
                });
        })
        .catch((err) => {
            res.status(Constants.HTTP_SERVER_ERROR).send(err);
        });
});

router.get(PATH_GET_ALL_SUBSCRIBED_CHANNELS_BY_USERNAME, (req, res) => {
    let token: string = req.headers[AUTH_KEY];

    jwtVerificationService.verifyJWTToken(token).subscribe(
        () => {
            const userChannelDAO = new UserChannelDAO(docClient);
            let username = req.params.username;
            userChannelDAO
                .getAllSubscribedChannels(username)
                .then((data) => {
                    res.status(Constants.HTTP_OK).send(data);
                })
                .catch((err) => {
                    res.status(Constants.HTTP_SERVER_ERROR).send(err);
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
                        res.status(Constants.HTTP_OK).send(data);
                    })
                    .catch((err) => {
                        res.status(Constants.HTTP_SERVER_ERROR).send(err);
                    });
            } else {
                res.status(Constants.HTTP_UNAUTHORIZED).send({
                    status: Constants.HTTP_UNAUTHORIZED,
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
                    .updateUser(sanitizeInput(req.body.username), sanitizeInput(req.body.email))
                    .then(() => {
                        res.status(Constants.HTTP_OK).send({
                            status: Constants.HTTP_OK,
                            data: { message: "User " + req.body.username + " updated successfully" }
                        });
                    })
                    .catch((err) => {
                        res.status(Constants.HTTP_SERVER_ERROR).send(err);
                    });
            } else {
                res.status(Constants.HTTP_UNAUTHORIZED).send({
                    status: Constants.HTTP_UNAUTHORIZED,
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
                        res.status(Constants.HTTP_OK).send(data);
                    })
                    .catch((err) => {
                        res.status(Constants.HTTP_SERVER_ERROR).send(err);
                    });
            } else {
                res.status(Constants.HTTP_UNAUTHORIZED).send({
                    status: Constants.HTTP_UNAUTHORIZED,
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
        () => {
            const usersDAO = new UserDAO(docClient);
            usersDAO
                .getAllUsers()
                .then((data) => {
                    res.status(Constants.HTTP_OK).send(data);
                })
                .catch((err) => {
                    res.status(Constants.HTTP_SERVER_ERROR).send(err);
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
        () => {
            let userChannelDAO = new UserChannelDAO(docClient);
            userChannelDAO
                .deleteChannelSubscription(req.params.username, req.params.channelId)
                .then(() => {
                    res.status(Constants.HTTP_OK).send({
                        status: Constants.HTTP_OK,
                        data: {
                            message: "User subscription deleted successfully"
                        }
                    });
                })
                .catch((err) => {
                    res.status(Constants.HTTP_SERVER_ERROR).send(err);
                });
        },
        (err) => {
            res.status(err.status).send(err);
        }
    );
});

router.get(PATH_GET_SETTINGS_INFO_FOR_USER, (req, res) => {
    let token: string = req.headers[AUTH_KEY];

    jwtVerificationService.verifyJWTToken(token).subscribe(
        (data: HTTPResponseAndToken) => {
            const settingsDAO: SettingsDAO = new SettingsDAO(docClient);

            let username = req.params.username;

            if (username === data.decodedToken[COGNITO_USERNAME]) {
                settingsDAO
                    .getSettingsInfoByUsername(username)
                    .then((data: Array<UserObject>) => {
                        res.status(Constants.HTTP_OK).send(data);
                    })
                    .catch((err) => {
                        res.status(Constants.HTTP_BAD_REQUEST).send(err);
                    });
            } else {
                res.status(Constants.HTTP_UNAUTHORIZED).send({
                    status: Constants.HTTP_UNAUTHORIZED,
                    data: { message: "Unauthorized to access user info" }
                });
            }
        },
        (err) => {
            res.status(err.status).send(err);
        }
    );
});

router.put(PATH_PUT_SETTINGS_FOR_USER, (req, res) => {
    let token: string = req.headers[AUTH_KEY];

    jwtVerificationService.verifyJWTToken(token).subscribe(
        (data) => {
            if (
                req.params.username === data.decodedToken[COGNITO_USERNAME] &&
                req.body.username === data.decodedToken[COGNITO_USERNAME]
            ) {
                if (req.body.explicit == Constants.EMPTY || req.body.explicit == null) {
                    req.body.explicit = false;
                }
                const settingsDAO: SettingsDAO = new SettingsDAO(docClient);
                settingsDAO
                    .updateSettings(sanitizeInput(req.body.username), sanitizeInput(req.body.theme), req.body.explicit)
                    .then(() => {
                        res.status(Constants.HTTP_OK).send({
                            status: Constants.HTTP_OK,
                            data: { message: "Settings for user" + req.body.username + "updated successfully" }
                        });
                    })
                    .catch((err) => {
                        res.status(Constants.HTTP_BAD_REQUEST).send(err);
                    });
            } else {
                res.status(Constants.HTTP_UNAUTHORIZED).send({
                    status: Constants.HTTP_UNAUTHORIZED,
                    data: { message: "Unauthorized to access user settings info" }
                });
            }
        },
        (err) => {
            res.status(err.status).send(err);
        }
    );
});

export = router;
