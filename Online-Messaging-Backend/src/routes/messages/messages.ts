/* tslint:disable:no-console */
import bodyParser from "body-parser";
import express from "express";
import MessageDAO from "./MessageDAO";

const router = express.Router();

const PATH_GET_ALL_MESSAGES: string = "/";

router.use(bodyParser());

router.get(PATH_GET_ALL_MESSAGES, (req, res) => {
    const messageDAO = new MessageDAO();
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
