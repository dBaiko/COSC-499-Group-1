/* tslint:disable:no-console */
import bodyParser from "body-parser";
import express from "express";
import ChannelDAO from "./ChannelDAO";
import UserChannelDAO from "../userChannels/UserChannelDAO";
import jwkToBuffer, { JWK } from "jwk-to-pem";
import * as jwt from "jsonwebtoken";
import { awsCognitoConfig, awsConfigPath } from "../../config/aws-config";
import MessageDAO from "../messages/MessageDAO";
import aws from "aws-sdk";

const PATH_GET_ALL_CHANNELS: string = "/";
const PATH_GET_CHANNEL_BY_ID: string = "/:channelId";
const PATH_GET_ALL_SUBSCRIBED_USERS_FOR_CHANNEL: string = "/:channelId/users";
const PATH_GET_ALL_MESSAGES_FOR_CHANNEL: string = "/:channelId/messages/";
const PATH_POST_NEW_USER_SUBSCRIPTION_TO_CHANNEL: string = "/:channelId/users";
const PATH_POST_NEW_CHANNEL: string = "/";

const router = express.Router();

const numRegExp: RegExp = /^\+?(0|[1-9]\d*)$/i;

const jwk: JWK = awsCognitoConfig;

aws.config.loadFromPath(awsConfigPath);
const docClient = new aws.DynamoDB.DocumentClient();

router.use(bodyParser());

router.get(PATH_GET_ALL_CHANNELS, (req, res) => {
    const channelDAO = new ChannelDAO(docClient);
    channelDAO
        .getAllChannels()
        .then((data) => {
            res.status(200).send(data);
        })
        .catch((err) => {
            res.status(400).send(err);
        });
});

router.get(PATH_GET_CHANNEL_BY_ID, (req, res) => {
    const channelDAO = new ChannelDAO(docClient);
    let channelIdString = req.params.channelId;
    channelDAO
        .getChannelInfo(Number(channelIdString))
        .then((data) => {
            res.status(200).send(data);
        })
        .catch((err) => {
            res.status(400).send(err);
        });
});

router.get(PATH_GET_ALL_SUBSCRIBED_USERS_FOR_CHANNEL, (req, res) => {
    const userChannelDAO = new UserChannelDAO(docClient);
    let channelId = req.params.channelId;
    userChannelDAO
        .getAllSubscribedUsers(Number(channelId))
        .then((data) => {
            res.status(200).send(data);
        })
        .catch((err) => {
            res.status(400).send(err);
        });
});

router.get(PATH_GET_ALL_MESSAGES_FOR_CHANNEL, (req, res) => {

    let token: string = req.headers["authorization"];
    if (token) {

        if (token.startsWith("Bearer ") || token.startsWith("Bearer")) {
            token = token.slice(7, token.length);
        }

        if (token) {

            let pem = jwkToBuffer(jwk);
            jwt.verify(token, pem, { algorithms: ["RS256"] }, (err, decodedToken) => {
                if (err) {
                    res.status(401).send({
                        status: 401,
                        data: { message: "Token is not valid" }
                    });
                } else {

                    console.log(JSON.stringify(decodedToken, null, 4));

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
                }
            });


        } else {
            res.status(401).send({
                status: 401,
                data: { message: "Auth token is missing" }
            });

        }


    } else {
        res.status(401).send({
            status: 401,
            data: { message: "Auth token is missing" }
        });
    }

});

router.post(PATH_POST_NEW_USER_SUBSCRIPTION_TO_CHANNEL, (req, res) => {
    console.log(req.body);
    console.log(req.params.channelId);
    const userChannelDAO = new UserChannelDAO(docClient);
    userChannelDAO
        .addNewUserToChannel(
            req.body.username,
            req.body.channelId,
            req.body.userChannelRole,
            req.body.channelName,
            req.body.channelType
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
});

router.post(PATH_POST_NEW_CHANNEL, (req, res) => {
    const channelDAO = new ChannelDAO(docClient);
    channelDAO
        .addNewChannel(
            req.body.channelName,
            req.body.channelType,
            req.body.firstUsername,
            req.body.firstUserChannelRole
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
});

export = router;
