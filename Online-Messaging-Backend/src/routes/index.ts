import express from 'express';
import getMessages from "./messages/getMessages";
import userRegistration from "./users/registerUser";
const router = express.Router();

router.use('/users/registerUser', userRegistration);
router.use('/messages/getMessages', getMessages);

export = router;
