/* tslint:disable:no-console */
import bodyParser from "body-parser";
import express from "express";
import MessageDAO from "./MessageDAO";
import aws from "aws-sdk";
import { awsConfigPath } from "../../config/aws-config";

const router = express.Router();

const PATH_GET_ALL_MESSAGES: string = "/";

aws.config.loadFromPath(awsConfigPath);
const docClient = new aws.DynamoDB.DocumentClient();

router.use(bodyParser());

router.get(PATH_GET_ALL_MESSAGES, (req, res) => {
    const messageDAO = new MessageDAO(docClient);
    messageDAO
        .getAllMessageHistory()
        .then((data) => {
            res.status(200).send(data);
        })
        .catch((err) => {
            res.status(400).send(err);
        });
});

export = router;
