import bodyParser from "body-parser";
import express from "express";
import ProfileDAO from "./ProfileDAO";
import aws from "aws-sdk";
import { awsConfigPath } from "../../config/aws-config";
import { JwtVerificationService } from "../../shared/jwt-verification-service";
import multer from "multer";

aws.config.loadFromPath(awsConfigPath);
const docClient = new aws.DynamoDB.DocumentClient();

const jwtVerificationService: JwtVerificationService = JwtVerificationService.getInstance();

const router = express.Router();

router.use(bodyParser.json({ limit: "50mb" }));
router.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));

const PATH_PUT_PROFILE: string = "/:username";
const PATH_GET_PROFILE: string = "/:username";
const PATH_UPDATE_PROFILE_IMAGE: string = "/:username/profile-image/";
const AUTH_KEY = "authorization";
const COGNITO_USERNAME = "cognito:username";

interface ProfileObject {
    username: string;
    firstName: string;
    lastName: string;
}

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "src/routes/profiles/temp");
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

router.put(PATH_UPDATE_PROFILE_IMAGE, upload.single("file"), (req, res) => {
    let token: string = req.headers[AUTH_KEY];

    jwtVerificationService.verifyJWTToken(token).subscribe(
        (data) => {
            const updateProfile = new ProfileDAO(docClient);
            updateProfile
                .updateProfileImage(req.file, req.body.username)
                .then((data) => {
                    res.status(200).send({
                        profileImage: data
                    });
                })
                .catch((err) => {
                    res.status(401).send({
                        status: 401,
                        data: { message: err }
                    });
                });
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
