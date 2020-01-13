import express from 'express';
import getMessages from "./messages/getMessages";
import userRegistration from "./users/registerUser";

const router = express.Router();

router.use('/users/', userRegistration);
router.use('/messages/', getMessages);

export = router;
