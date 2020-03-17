import bodyParser from "body-parser";
import express from "express";
import ProfileDAO from "./ProfileDAO";
import aws from "aws-sdk";
import { awsConfigPath } from "../../config/aws-config";
import { JwtVerificationService } from "../../shared/jwt-verification-service";

aws.config.loadFromPath(awsConfigPath);
const docClient = new aws.DynamoDB.DocumentClient();

const jwtVerificationService: JwtVerificationService = JwtVerificationService.getInstance();

const router = express.Router();

router.use(bodyParser());

const PATH_PUT_PROFILE: string = "/:username";
const PATH_GET_PROFILE: string = "/:username";
const AUTH_KEY = "authorization";
const COGNITO_USERNAME = "cognito:username";

interface ProfileObject {
    username: string;
    firstName: string;
    lastName: string;
}

router.put(PATH_PUT_PROFILE, (req, res) => {
    let token: string = req.headers[AUTH_KEY];

    jwtVerificationService.verifyJWTToken(token).subscribe(
        (data) => {
            if (
                req.params.username === data.decodedToken[COGNITO_USERNAME] &&
                req.body.username === data.decodedToken[COGNITO_USERNAME]
            ) {
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
            } else {
                res.status(401).send({
                    status: 401,
                    data: { message: "Unauthorized to access user profile info" }
                });
            }
        },
        (err) => {
            res.status(err.status).send(err);
        }
    );
});

router.get(PATH_GET_PROFILE, (req, res) => {
    let token: string = req.headers[AUTH_KEY];

    jwtVerificationService.verifyJWTToken(token).subscribe(
        (data) => {
            const getProfile = new ProfileDAO(docClient);
            let username = req.params.username;

            getProfile
                .getUserProfile(username)
                .then((data: Array<ProfileObject>) => {
                    res.status(200).send(data);
                })
                .catch((err) => {
                    res.status(400).send(err);
                });
        },
        (err) => {
            res.status(err.status).send(err);
        }
    );
});

export = router;
