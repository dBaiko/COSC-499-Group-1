import bodyParser from "body-parser";
import express from "express";
import UserDAO from "./UserDAO";
import UserChannelDAO from "../userChannels/UserChannelDAO";
import aws from "aws-sdk";
import { awsConfigPath } from "../../config/aws-config";
import { HTTPResponse, JwtVerificationService } from "../../shared/jwt-verification-service";

const router = express.Router();

const PATH_GET_ALL_SUBSCRIBED_CHANNELS_BY_USERNAME = "/:username/channels";
const PATH_POST_NEW_USER = "/";
const PATH_GET_USER_BY_USERNAME = "/:username";
const AUTH_KEY = "authorization";

const jwtVerificationService: JwtVerificationService = JwtVerificationService.getInstance();

aws.config.loadFromPath(awsConfigPath);
const docClient = new aws.DynamoDB.DocumentClient();

router.use(bodyParser());

router.post(PATH_POST_NEW_USER, (req, res) => {
    const userRegistration = new UserDAO(docClient);
    userRegistration
        .createNewUser(req.body.username, req.body.email, req.body.firstName, req.body.lastName)
        .then(() => {
            res.status(200).send({ status: 200, data: { message: "New user added successfully" } });
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
        (err: HTTPResponse) => {
            res.status(err.status).send(err);
        }
    );
});

router.get(PATH_GET_USER_BY_USERNAME, (req, res) => {
    let token: string = req.headers[AUTH_KEY];

    jwtVerificationService.verifyJWTToken(token).subscribe(
        (data) => {
            const userDAO = new UserDAO(docClient);
            let username = req.params.username;
            userDAO
                .getUserInfoByUsername(username)
                .then((data) => {
                    res.status(200).send(data);
                })
                .catch((err) => {
                    res.status(400).send(err);
                });
        },
        (err: HTTPResponse) => {
            res.status(err.status).send(err);
        }
    );
});

export = router;
