/* tslint:disable:no-console */
import bodyParser from "body-parser";
import express from "express";
import ChannelDAO from "./ChannelDAO";
import UserChannelDAO from "../userChannels/UserChannelDAO";
import MessageDAO from "../messages/MessageDAO";

const router = express.Router();

const numRegExp: RegExp = /^\+?(0|[1-9]\d*)$/i;

router.use(bodyParser());

router.get("/", (req, res) => {
    const channelDAO = new ChannelDAO();
    channelDAO.getAllChannels()
        .then((data) => {
            res.status(200).send(data);
        })
        .catch((err) => {
            res.status(400).send(err);
        });
});

router.get("/:channelId", (req, res) => {
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

router.get("/:channelId/users", (req, res) => {
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

router.get("/:channelId/messages/", (req, res) => {
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

router.post("/:channelId/users", (req, res) => {
    console.log(req.body);
    console.log(req.params.channelId);
    const userChannelDAO = new UserChannelDAO();
    userChannelDAO.addNewUserToChannel(req.body.username, req.body.channelId, req.body.userChannelRole, req.body.channelName, req.body.channelType)
        .then(() => {
            res.status(200).send({status: 200, data: {message: "New userChannel added successfully"}});
        })
        .catch((err) => {
            res.status(400).send(err);
        });
});

router.post("/", (req, res) => {
    const channelDAO = new ChannelDAO();
    channelDAO.addNewChannel(req.body.channelName, req.body.channelType, req.body.firstUsername, req.body.firstUserChannelRole)
        .then(() => {
            res.status(200).send({status: 200, data: {message: "New channel added successfully"}});
        })
        .catch((err) => {
            res.status(400).send(err);
        });
});

export = router;
