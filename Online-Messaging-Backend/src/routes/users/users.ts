import bodyParser from "body-parser";
import express from "express";
import UserDAO from "./UserDAO";
import UserChannelDAO from "../userChannels/UserChannelDAO";

const router = express.Router();

const PATH_GET_ALL_SUBSCRIBED_CHANNELS_BY_USERNAME = "/:username/channels";
const PATH_POST_NEW_USER = "/";

router.use(bodyParser());

router.post(PATH_POST_NEW_USER, (req, res) => {
    const userRegistration = new UserDAO();
    userRegistration.createNewUser(req.body.username, req.body.email, req.body.firstName, req.body.lastName)
        .then(() => {
            res.status(200).send({status: 200, data: {message: "New user added successfully"}});
        })
        .catch((err) => {
            res.status(400).send(err);
        });
});


router.get(PATH_GET_ALL_SUBSCRIBED_CHANNELS_BY_USERNAME, (req, res) => {
    const userChannelDAO = new UserChannelDAO();
    let username = req.params.username;
    userChannelDAO.getAllSubscribedChannels(username)
        .then((data) => {
            res.status(200).send(data);
        })
        .catch((err) => {
            res.status(400).send(err);
        });
});

export = router;
