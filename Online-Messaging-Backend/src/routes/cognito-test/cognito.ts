/* tslint:disable:no-console */
import bodyParser from "body-parser";
import express from "express";
import { TestUserData } from "../../config/aws-config";
import { CognitoDAO } from "./cognitoDAO";

const PATH_GET_JWT: string = "/";

const router = express.Router();

router.use(bodyParser());

router.get(PATH_GET_JWT, (req, res) => {
    let adminPassword = req.headers["authorization"];

    if (adminPassword) {

        if (adminPassword.startsWith("Bearer ") || adminPassword.startsWith("Bearer")) {
            adminPassword = adminPassword.slice(7, adminPassword.length);
        }

        if (adminPassword === TestUserData.correctAdminPassword) {
            const cognitoDAO = new CognitoDAO();
            cognitoDAO
                .login(TestUserData.testUsername, TestUserData.testPassword).toPromise()
                .then((data) => {
                    let sendData = {
                        jwt: data
                    };
                    res.status(200).send(sendData);
                })
                .catch((err) => {
                    console.log(err);
                    res.status(400).send(err);
                });
        } else {
            res.status(401).send({
                status: 401,
                data: { message: "Admin password is invalid" }
            });
        }


    } else {
        res.status(401).send({
            status: 401,
            data: { message: "Admin password is missing" }
        });
    }


});


export = router;
