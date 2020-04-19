import bodyParser from "body-parser";
import express from "express";
import { ProfileDAO } from "./ProfileDAO";
import aws from "aws-sdk";
import { awsConfigPath } from "../../config/aws-config";
import { JwtVerificationService } from "../../shared/jwt-verification-service";
import multer from "multer";
import { sanitizeInput } from "../../index";
import { Constants, ProfileObject } from "../../config/app-config";
import {
    AUTH_KEY,
    COGNITO_USERNAME,
    FILE,
    PATH_GET_PROFILE,
    PATH_PUT_PROFILE,
    PATH_UPDATE_PROFILE_IMAGE,
    PATH_UPDATE_STATUS,
    TEMP_DIRECTORY
} from "./Profile_Constansts";

aws.config.loadFromPath(awsConfigPath);
const docClient = new aws.DynamoDB.DocumentClient();

const jwtVerificationService: JwtVerificationService = JwtVerificationService.getInstance();

const router = express.Router();

router.use(bodyParser.json({ limit: "50mb" }));
router.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, TEMP_DIRECTORY);
    },
    filename: (req, file, callback) => {
        callback(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

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
                    .updateProfile(req.body)
                    .then(() => {
                        res.status(Constants.HTTP_OK).send({
                            status: Constants.HTTP_OK,
                            data: { message: "Profile for user" + req.body.username + "updated successfully" }
                        });
                    })
                    .catch((err) => {
                        res.status(Constants.HTTP_BAD_REQUEST).send(err);
                    });
            } else {
                res.status(Constants.HTTP_UNAUTHORIZED).send({
                    status: Constants.HTTP_UNAUTHORIZED,
                    data: { message: "Unauthorized to access user profile info" }
                });
            }
        },
        (err) => {
            res.status(err.status).send(err);
        }
    );
});

router.put(PATH_UPDATE_PROFILE_IMAGE, upload.single(FILE), (req, res) => {
    let token: string = req.headers[AUTH_KEY];

    jwtVerificationService.verifyJWTToken(token).subscribe(
        (data) => {
            if (
                req.params.username === data.decodedToken[COGNITO_USERNAME] &&
                req.body.username === data.decodedToken[COGNITO_USERNAME]
            ) {
                const updateProfile = new ProfileDAO(docClient);
                updateProfile
                    .updateProfileImage(req.file, req.body.username)
                    .then((data) => {
                        res.status(Constants.HTTP_OK).send({
                            profileImage: data
                        });
                    })
                    .catch((err) => {
                        res.status(Constants.HTTP_UNAUTHORIZED).send({
                            status: Constants.HTTP_UNAUTHORIZED,
                            data: { message: err }
                        });
                    });
            } else {
                res.status(Constants.HTTP_UNAUTHORIZED).send({
                    status: Constants.HTTP_UNAUTHORIZED,
                    data: { message: "Unauthorized to access user profile info" }
                });
            }
        },
        (err) => {
            res.status(err.status).send(err);
        }
    );
});

router.put(PATH_UPDATE_STATUS, (req, res) => {
    let token: string = req.headers[AUTH_KEY];

    jwtVerificationService.verifyJWTToken(token).subscribe(
        (data) => {
            if (
                req.params.username === data.decodedToken[COGNITO_USERNAME] &&
                req.body.username === data.decodedToken[COGNITO_USERNAME]
            ) {
                const updateProfile = new ProfileDAO(docClient);
                updateProfile
                    .updateStatus(sanitizeInput(req.body.username), sanitizeInput(req.body.status))
                    .then(() => {
                        res.status(Constants.HTTP_OK).send({});
                    })
                    .catch((err) => {
                        res.status(Constants.HTTP_UNAUTHORIZED).send({
                            status: Constants.HTTP_UNAUTHORIZED,
                            data: { message: err }
                        });
                    });
            } else {
                res.status(Constants.HTTP_UNAUTHORIZED).send({
                    status: Constants.HTTP_UNAUTHORIZED,
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
        () => {
            const getProfile = new ProfileDAO(docClient);
            let username = req.params.username;

            getProfile
                .getUserProfile(username)
                .then((data: Array<ProfileObject>) => {
                    res.status(Constants.HTTP_OK).send(data);
                })
                .catch((err) => {
                    res.status(Constants.HTTP_BAD_REQUEST).send(err);
                });
        },
        (err) => {
            res.status(err.status).send(err);
        }
    );
});

export = router;
