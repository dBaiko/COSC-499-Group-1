/* tslint:disable:no-console */
import bodyParser from "body-parser";
import express from "express";
import { TestUserData } from "../../config/aws-config";
import { CognitoDAO } from "./cognitoDAO";
import { Constants } from "../../config/app-config";

const PATH_GET_JWT: string = Constants.SLASH;

const router = express.Router();

router.use(bodyParser.json());

router.get(PATH_GET_JWT, (req, res) => {
    let adminPassword = req.headers["authorization"];

    if (adminPassword) {
        if (adminPassword.startsWith("Bearer ") || adminPassword.startsWith("Bearer")) {
            adminPassword = adminPassword.slice(7, adminPassword.length);
        }

        if (adminPassword === TestUserData.correctAdminPassword) {
            const cognitoDAO = new CognitoDAO();
            cognitoDAO
                .login(TestUserData.testUsername, TestUserData.testPassword)
                .toPromise()
                .then((data) => {
                    let sendData = {
                        jwt: data
                    };
                    res.status(Constants.HTTP_OK).send(sendData);
                })
                .catch((err) => {
                    console.log(err);
                    res.status(Constants.HTTP_BAD_REQUEST).send(err);
                });
        } else {
            res.status(Constants.HTTP_UNAUTHORIZED).send({
                status: Constants.HTTP_UNAUTHORIZED,
                data: { message: "Admin password is invalid" }
            });
        }
    } else {
        res.status(Constants.HTTP_UNAUTHORIZED).send({
            status: Constants.HTTP_UNAUTHORIZED,
            data: { message: "Admin password is missing" }
        });
    }
});

export = router;
