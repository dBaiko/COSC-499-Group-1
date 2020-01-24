/* tslint:disable:no-console */
import bodyParser from "body-parser";
import express from 'express';
import UserChannelDAO from "./UserChannelDAO";

const router = express.Router();

const numRegExp: RegExp = /^\+?(0|[1-9]\d*)$/i;

router.use(bodyParser());

router.get('/', (req, res) => {
    const userChannelDAO = new UserChannelDAO();
    userChannelDAO.getAll()
        .then((data) => {
            res.status(200).send(data);
        })
        .catch((err) => {
            res.status(400).send(err);
        });
});

router.get('/users/:username', (req, res) => {
    const userChannelDAO = new UserChannelDAO();
    let username = req.params.username;
    const response = userChannelDAO.getAllSubscribedChannels(username)
        .then((data) => {
            res.status(200).send(data);
        })
        .catch((err) => {
            res.status(400).send(err);
        });
});

router.get('/channels/:channelId', (req, res) => {
    const userChannelDAO = new UserChannelDAO();
    let channelId = req.params.channelId;
    const response = userChannelDAO.getAllSubscribedUsers(Number(channelId))
        .then((data) => {
            res.status(200).send(data);
        })
        .catch((err) => {
            res.status(400).send(err);
        });
});

router.post('/', (req, res) => {
    const userChannelDAO = new UserChannelDAO();
    userChannelDAO.addNewUserToChannel(req.body.username, req.body.channelId, req.body.userChannelRole, req.body.channelName, req.body.channelType)
        .then(() => {
            res.status(200).send({status: 200, data: {message: "New userChannel added successfully"}});
        })
        .catch((err) => {
            res.status(400).send(err);
        });
});

export = router;
