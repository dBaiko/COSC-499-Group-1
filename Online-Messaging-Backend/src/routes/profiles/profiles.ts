import bodyParser from "body-parser";
import express from "express";
import ProfileDAO from "./ProfileDAO";
import aws from "aws-sdk";
import { awsConfigPath } from "../../config/aws-config";

aws.config.loadFromPath(awsConfigPath);
const docClient = new aws.DynamoDB.DocumentClient();

const router = express.Router();

router.use(bodyParser());

const PATH_PUT_PROFILE: string = "/";
const PATH_GET_PROFILE: string = "/:username";

router.put(PATH_PUT_PROFILE, (req, res) => {
    const updateProfile = new ProfileDAO(docClient);
    updateProfile
        .updateProfile(req.body.username, req.body.firstName, req.body.lastName)
        .then(() => {
            res.status(200).send({
                status: 200,
                data: { message: "Profile for user" + req.body.username + "updated successfully" }
            });
        })
        .catch((err) => {
            res.status(400).send(err);
        });
});

router.get(PATH_GET_PROFILE, (req, res) => {
    const getProfile = new ProfileDAO(docClient);
    let username = req.params.username;

    const response = getProfile
        .getUserProfile(username)
        .then((data) => {
            res.status(200).send(data);
        })
        .catch((err) => {
            res.status(400).send(err);
        });
});

export = router;
