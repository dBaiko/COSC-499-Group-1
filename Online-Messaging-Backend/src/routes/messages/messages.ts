/* tslint:disable:no-console */
import bodyParser from "body-parser";
import express from "express";
import MessageDAO from "./MessageDAO";
import aws from "aws-sdk";
import { awsConfigPath } from "../../config/aws-config";
import { JwtVerificationService } from "../../shared/jwt-verification-service";

const router = express.Router();
const AUTH_KEY = "authorization";
const COGNITO_USERNAME = "cognito:username";

const PATH_GET_ALL_MESSAGES: string = "/";
const PATH_DELETE_MESSAGE: string = "/:messageId/:channelId/:insertTime/:username/";
const PATH_PUT_MESSAGE: string = "/:messageId/";

const jwtVerificationService: JwtVerificationService = JwtVerificationService.getInstance();

aws.config.loadFromPath(awsConfigPath);
const docClient = new aws.DynamoDB.DocumentClient();

router.use(bodyParser());

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
                messageDAO.updateMessage(req.body)
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
                messageDAO.deleteMessage(req.params.messageId, req.params.channelId, +req.params.insertTime)
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

export = router;
