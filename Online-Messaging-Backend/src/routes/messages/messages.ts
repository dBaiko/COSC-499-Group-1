import bodyParser from "body-parser";
import express from "express";
import { MessageDAO } from "./MessageDAO";
import aws from "aws-sdk";
import { awsConfigPath } from "../../config/aws-config";
import { JwtVerificationService } from "../../shared/jwt-verification-service";
import { ReactionsDAO } from "../reactions/ReactionsDAO";
import { sanitizeInput } from "../../index";
import { Constants, HTTPResponseAndToken, ReactionObject } from "../../config/app-config";
import {
    AUTH_KEY,
    COGNITO_USERNAME,
    PATH_ADMIN_DELETE_MESSAGE,
    PATH_DELETE_EMOJI_FOR_MESSAGE,
    PATH_DELETE_MESSAGE,
    PATH_GET_ALL_MESSAGES,
    PATH_GET_MESSAGE_REACTIONS,
    PATH_POST_NEW_REACTION,
    PATH_PUT_MESSAGE
} from "./Messages_Constants";

const router = express.Router();

const jwtVerificationService: JwtVerificationService = JwtVerificationService.getInstance();

aws.config.loadFromPath(awsConfigPath);
const docClient = new aws.DynamoDB.DocumentClient();

router.use(bodyParser.json());

router.get(PATH_GET_ALL_MESSAGES, (req, res) => {
    let token: string = req.headers[AUTH_KEY];

    jwtVerificationService.verifyJWTToken(token).subscribe(
        () => {
            const messageDAO = new MessageDAO(docClient);
            messageDAO
                .getAllMessageHistory()
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

router.put(PATH_PUT_MESSAGE, (req, res) => {
    let token: string = req.headers[AUTH_KEY];

    jwtVerificationService.verifyJWTToken(token).subscribe(
        (data: HTTPResponseAndToken) => {
            if (data.decodedToken[COGNITO_USERNAME] == req.body.username) {
                let messageDAO = new MessageDAO(docClient);
                messageDAO
                    .updateMessage(req.body)
                    .then(() => {
                        res.status(Constants.HTTP_OK).send();
                    })
                    .catch((err) => {
                        console.error(err);
                        res.status(Constants.HTTP_UNAUTHORIZED).send(err);
                    });
            } else {
                res.status(Constants.HTTP_UNAUTHORIZED).send({
                    status: Constants.HTTP_UNAUTHORIZED,
                    data: { message: "Unauthorized to access user data" }
                });
            }
        },
        (err) => {
            res.status(err.status).send(err);
        }
    );
});

router.delete(PATH_DELETE_MESSAGE, (req, res) => {
    let token: string = req.headers[AUTH_KEY];

    jwtVerificationService.verifyJWTToken(token).subscribe(
        (data: HTTPResponseAndToken) => {
            if (data.decodedToken[COGNITO_USERNAME] == req.params.username) {
                let messageDAO = new MessageDAO(docClient);
                messageDAO
                    .deleteMessage(req.params.messageId, req.params.channelId, +req.params.insertTime)
                    .then(() => {
                        res.status(Constants.HTTP_OK).send();
                    })
                    .catch((err) => {
                        console.error(err);
                        res.status(Constants.HTTP_UNAUTHORIZED).send(err);
                    });
            } else {
                res.status(Constants.HTTP_UNAUTHORIZED).send({
                    status: Constants.HTTP_UNAUTHORIZED,
                    data: { message: "Unauthorized to access user data" }
                });
            }
        },
        (err) => {
            res.status(err.status).send(err);
        }
    );
});

router.delete(PATH_ADMIN_DELETE_MESSAGE, (req, res) => {
    let token: string = req.headers[AUTH_KEY];

    jwtVerificationService.verifyJWTToken(token).subscribe(
        () => {
            let messageDAO = new MessageDAO(docClient);
            messageDAO
                .adminDeleteMessage(req.params.messageId, req.params.channelId, +req.params.insertTime)
                .then(() => {
                    res.status(Constants.HTTP_OK).send();
                })
                .catch((err) => {
                    console.error(err);
                    res.status(Constants.HTTP_UNAUTHORIZED).send(err);
                });
        },
        (err) => {
            res.status(err.status).send(err);
        }
    );
});

router.get(PATH_GET_MESSAGE_REACTIONS, (req, res) => {
    let token: string = req.headers[AUTH_KEY];

    jwtVerificationService.verifyJWTToken(token).subscribe(
        () => {
            let reactionsDAO: ReactionsDAO = new ReactionsDAO(docClient);
            reactionsDAO
                .getAllReactionsForMessage(req.params.messageId)
                .then((data: Array<ReactionObject>) => {
                    let a = [];
                    let b = [];
                    let prev: ReactionObject = {
                        messageId: Constants.EMPTY,
                        emoji: Constants.EMPTY,
                        insertTime: null,
                        username: Constants.EMPTY
                    };

                    data = data.sort((a: ReactionObject, b: ReactionObject) => (a.emoji < b.emoji ? 1 : -1));
                    for (let i = 0; i < data.length; i++) {
                        if (data[i].emoji !== prev.emoji) {
                            a.push(data[i].emoji);
                            b.push(1);
                        } else {
                            b[b.length - 1]++;
                        }
                        prev = data[i];
                    }

                    let usernames = [];
                    let temp: Array<string> = [];

                    for (let i = 0; i < a.length; i++) {
                        for (let j = 0; j < data.length; j++) {
                            if (data[j].emoji == a[i] && !temp.includes(data[j].username)) {
                                temp.push(data[j].username);
                            }
                        }
                        usernames.push(temp);
                        temp = [];
                    }

                    let ret = [];

                    for (let i = 0; i < a.length; i++) {
                        ret.push({
                            emoji: a[i],
                            count: b[i],
                            username: usernames[i]
                        });
                    }

                    res.status(Constants.HTTP_OK).send(ret);
                })
                .catch((err) => {
                    console.error(err);
                    res.status(Constants.HTTP_SERVER_ERROR).send(err);
                });
        },
        (err) => {
            res.status(err.status).send(err);
        }
    );
});

router.post(PATH_POST_NEW_REACTION, (req, res) => {
    let token: string = req.headers[AUTH_KEY];

    jwtVerificationService.verifyJWTToken(token).subscribe(
        (data: HTTPResponseAndToken) => {
            if (data.decodedToken[COGNITO_USERNAME] == req.body.username) {
                let reactionsDAO: ReactionsDAO = new ReactionsDAO(docClient);
                reactionsDAO
                    .addNewReaction(
                        req.params.messageId,
                        sanitizeInput(req.body.emoji),
                        sanitizeInput(req.body.username)
                    )
                    .then(() => {
                        res.status(Constants.HTTP_OK).send({
                            status: Constants.HTTP_OK,
                            message: "Reaction added successfully"
                        });
                    })
                    .catch((err) => {
                        res.status(Constants.HTTP_SERVER_ERROR).send(err);
                    });
            } else {
                res.status(Constants.HTTP_UNAUTHORIZED).send({
                    status: Constants.HTTP_UNAUTHORIZED,
                    data: { message: "Unauthorized to access user data" }
                });
            }
        },
        (err) => {
            res.status(err.status).send(err);
        }
    );
});

router.delete(PATH_DELETE_EMOJI_FOR_MESSAGE, (req, res) => {
    let token: string = req.headers[AUTH_KEY];

    jwtVerificationService.verifyJWTToken(token).subscribe(
        (data: HTTPResponseAndToken) => {
            if (data.decodedToken[COGNITO_USERNAME] == req.params.username) {
                let reactionsDAO: ReactionsDAO = new ReactionsDAO(docClient);
                reactionsDAO
                    .deleteReactionForMessage(req.params.messageId, req.params.emoji, req.params.username)
                    .then(() => {
                        res.status(Constants.HTTP_OK).send({
                            status: Constants.HTTP_OK,
                            message: "Reaction deleted successfully"
                        });
                    })
                    .catch((err) => {
                        res.status(Constants.HTTP_SERVER_ERROR).send(err);
                    });
            } else {
                res.status(Constants.HTTP_UNAUTHORIZED).send({
                    status: Constants.HTTP_UNAUTHORIZED,
                    data: { message: "Unauthorized to access user data" }
                });
            }
        },
        (err) => {
            res.status(err.status).send(err);
        }
    );
});

export = router;
