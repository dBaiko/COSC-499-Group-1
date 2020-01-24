import express from 'express';
import getMessages from "./messages/messages";
import getChannels from "./channels/channels"
import userRegistration from "./users/users";
import userChannels from "./userChannels/userChannel"

const router = express.Router();

router.use('/users/', userRegistration);
router.use('/messages/', getMessages);
router.use('/channels/', getChannels);
router.use("/userChannels/", userChannels);

export = router;
