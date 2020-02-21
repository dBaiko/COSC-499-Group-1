import express from "express";
import getMessages from "./messages/messages";
import getChannels from "./channels/channels";
import userRegistration from "./users/users";
import cognito from "./cognito-test/cognito";

const router = express.Router();

router.use("/users/", userRegistration);
router.use("/messages/", getMessages);
router.use("/channels/", getChannels);
router.use("/admin-cognito-jwt/", cognito);

export = router;
