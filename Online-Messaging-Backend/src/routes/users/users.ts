import bodyParser from "body-parser";
import express from "express";
import UserDAO from "./UserDAO";
import UserChannelDAO from "../userChannels/UserChannelDAO";
import aws from "aws-sdk";
import { awsConfigPath } from "../../config/aws-config";

const router = express.Router();

const PATH_GET_ALL_SUBSCRIBED_CHANNELS_BY_USERNAME = "/:username/channels";
const PATH_POST_NEW_USER = "/";
const PATH_GET_USER_BY_USERNAME = "/:username";

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
});

router.get(PATH_GET_USER_BY_USERNAME, (req, res) => {
    const userDAO = new UserDAO(docClient);
    let username = req.params.username;
    userDAO.getUserInfoByUsername(username)
        .then((data) => {
            res.status(200).send(data);
        })
        .catch((err) => {
            res.status(400).send(err);
        });
});

export = router;
