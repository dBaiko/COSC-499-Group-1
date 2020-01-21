import bodyParser from "body-parser";
import express from 'express';
import ProfileDAO from "./ProfileDAO";

const router = express.Router();

router.use(bodyParser());

router.post('/', (req, res) => {
    const defaultProfile = new ProfileDAO();
    defaultProfile.createProfileFromUser(req.body.username, req.body.email, req.body.firstName, req.body.lastName)
        .then(() => {
            res.status(200).send({status: 200, data: {message: "New profile created successfully"}});
        })
        .catch((err) => {
            res.status(400).send(err);
        });
});

export = router;
