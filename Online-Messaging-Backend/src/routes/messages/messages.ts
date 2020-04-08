/* tslint:disable:no-console */
import bodyParser from "body-parser";
import express from "express";
import MessageDAO from "./MessageDAO";
import aws from "aws-sdk";
import { awsConfigPath } from "../../config/aws-config";
import { JwtVerificationService } from "../../shared/jwt-verification-service";
import ReactionsDAO, { ReactionObject } from "../reactions/ReactionsDAO";

const router = express.Router();
const AUTH_KEY = "authorization";
const COGNITO_USERNAME = "cognito:username";

const PATH_GET_ALL_MESSAGES: string = "/";
const PATH_DELETE_MESSAGE: string = "/:messageId/:channelId/:insertTime/:username/";
const PATH_PUT_MESSAGE: string = "/:messageId/";
const PATH_GET_MESSAGE_REACTIONS = "/:messageId/reactions";
const PATH_POST_NEW_REACTION = "/:messageId/reaction/";
const PATH_DELETE_EMOJI_FOR_MESSAGE = "/:messageId/reaction/";


const jwtVerificationService: JwtVerificationService = JwtVerificationService.getInstance();

aws.config.loadFromPath(awsConfigPath);
const docClient = new aws.DynamoDB.DocumentClient();

router.use(bodyParser.json());

router.get(PATH_GET_ALL_MESSAGES, (req, res) => {
    let token: string = req.headers[AUTH_KEY];

    jwtVerificationService.verifyJWTToken(token).subscribe(
        (data) => {
            const messageDAO = new MessageDAO(docClient);
            messageDAO
                .getAllMessageHistory()
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

router.put(PATH_PUT_MESSAGE, (req, res) => {
    let token: string = req.headers[AUTH_KEY];

    jwtVerificationService.verifyJWTToken(token).subscribe(
        (data) => {
            if (data.decodedToken[COGNITO_USERNAME] == req.body.username) {
                let messageDAO = new MessageDAO(docClient);
                messageDAO
                    .updateMessage(req.body)
                    .then(() => {
                        console.log("success update message");
                        res.status(200).send();
                    })
                    .catch((err) => {
                        console.log(err);
                        res.status(401).send(err);
                    });
            } else {
                res.status(401).send({
                    status: 401,
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
        (data) => {
            if (data.decodedToken[COGNITO_USERNAME] == req.params.username) {
                let messageDAO = new MessageDAO(docClient);
                messageDAO
                    .deleteMessage(req.params.messageId, req.params.channelId, +req.params.insertTime)
                    .then(() => {
                        console.log("success delete message");
                        res.status(200).send();
                    })
                    .catch((err) => {
                        console.log(err);
                        res.status(401).send(err);
                    });
            } else {
                res.status(401).send({
                    status: 401,
                    data: { message: "Unauthorized to access user data" }
                });
            }
        },
        (err) => {
            res.status(err.status).send(err);
        }
    );
});

router.get(PATH_GET_MESSAGE_REACTIONS, (req, res) => {
    let token: string = req.headers[AUTH_KEY];

    jwtVerificationService.verifyJWTToken(token).subscribe(
        (data) => {
            let reactionsDAO: ReactionsDAO = new ReactionsDAO(docClient);
            reactionsDAO.getAllReactionsForMessage(req.params.messageId)
                .then((data: Array<ReactionObject>) => {

                    let a = [];
                    let b = [];
                    let prev: ReactionObject = {
                        messageId: "",
                        emoji: "",
                        insertTime: null
                    };

                    data.sort();
                    for (let i = 0; i < data.length; i++) {
                        if (data[i].emoji !== prev.emoji) {
                            a.push(data[i].emoji);
                            b.push(1);
                        } else {
                            b[b.length - 1]++;
                        }
                        prev = data[i];
                    }

                    let ret = [];

                    for (let i = 0; i < a.length; i++) {
                        ret.push({
                            emoji: a[i],
                            count: b[i]
                        });
                    }

                    res.status(200).send(ret);
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).send(err);
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
        (data) => {
            if (data.decodedToken[COGNITO_USERNAME] == req.body.username) {
                let reactionsDAO: ReactionsDAO = new ReactionsDAO(docClient);
                reactionsDAO.addNewReaction(req.params.messageId, req.body.emoji)
                    .then(() => {
                        res.status(200).send({
                            status: 200,
                            message: "Reaction added successfully"
                        });
                    })
                    .catch((err) => {
                        res.status(500).send(err);
                    });
            } else {
                res.status(401).send({
                    status: 401,
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
        (data) => {
            if (data.decodedToken[COGNITO_USERNAME] == req.body.username) {
                let reactionsDAO: ReactionsDAO = new ReactionsDAO(docClient);
                reactionsDAO.deleteReactionForMessage(req.params.messageId, req.body.emoji)
                    .then(() => {
                        res.status(200).send({
                            status: 200,
                            message: "Reaction deleted successfully"
                        });
                    })
                    .catch((err) => {
                        res.status(500).send(err);
                    });
            } else {
                res.status(401).send({
                    status: 401,
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
