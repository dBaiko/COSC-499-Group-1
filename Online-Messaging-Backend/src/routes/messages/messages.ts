/* tslint:disable:no-console */
import bodyParser from "body-parser";
import express from "express";
import MessageDAO from "./MessageDAO";
import aws from "aws-sdk";
import { awsConfigPath } from "../../config/aws-config";
import { JwtVerificationService } from "../../shared/jwt-verification-service";

const router = express.Router();
const AUTH_KEY = "authorization";

const PATH_GET_ALL_MESSAGES: string = "/";

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

export = router;
