/* tslint:disable:no-console */
import bodyParser from "body-parser";
import express from 'express';
import ChannelDAO from "./ChannelDAO";

const router = express.Router();

const numRegExp: RegExp = /^\+?(0|[1-9]\d*)$/i;

router.use(bodyParser());

router.get('/', (req, res) => {
    const channelDAO = new ChannelDAO();
    channelDAO.getAllChannels()
        .then((data) => {
            res.status(200).send(data);
        })
        .catch((err) => {
            res.status(400).send(err);
        });
});

router.get('/:channelId', (req, res) => {
    const channelDAO = new ChannelDAO();
    let channelIdString = req.params.channelId;
    if (numRegExp.test(channelIdString)) {
        const response = channelDAO.getChannelInfo(Number(channelIdString))
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
