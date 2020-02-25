import express from "express";
import getMessages from "./messages/messages";
import getChannels from "./channels/channels";
import userRegistration from "./users/users";
import profiles from "./profiles/profiles";
import notifications from "./notifications/notifications";
import cognito from "./cognito-test/cognito";

const router = express.Router();

router.use("/users/", userRegistration);
router.use("/messages/", getMessages);
router.use("/channels/", getChannels);
router.use("/profiles/", profiles);
router.use("/notifications/", notifications);
router.use("/admin-cognito-jwt/", cognito);

export = router;
