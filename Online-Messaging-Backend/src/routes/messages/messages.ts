/* tslint:disable:no-console */
import bodyParser from "body-parser";
import express from 'express';
import MessageDAO from "./MessageDAO";

const router = express.Router();

const numRegExp: RegExp = /^\+?(0|[1-9]\d*)$/i;

router.use(bodyParser());

router.get('/', (req, res) => {
    const messageDAO = new MessageDAO();
    const response = messageDAO.getAllMessageHistory()
        .then((data) => {
            res.status(200).send(data);
        })
        .catch((err) => {
            res.status(400).send(err);
        });
});

router.get('/:channelId', (req, res) => {
    const messageDAO = new MessageDAO();
    let channelIdString = req.params.channelId;
    if (numRegExp.test(channelIdString)) {
        const response = messageDAO.getMessageHistory(Number(channelIdString))
            .then((data) => {
                res.status(200).send(data);
            })
            .catch((err) => {
                res.status(400).send(err);
            });
    } else {
        res.status(400).send("ChannelId must be a positive integer");
    }

});

export = router;
