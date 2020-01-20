import express from 'express';
import getMessages from "./messages/getMessages";
import getChannels from "./channels/getChannels"
import userRegistration from "./users/registerUser";

const router = express.Router();

router.use('/users/', userRegistration);
router.use('/messages/', getMessages);
router.use('/channels/', getChannels)

export = router;
