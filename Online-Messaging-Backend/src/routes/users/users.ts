import bodyParser from "body-parser";
import express from 'express';
import UserDAO from "./UserDAO";

const router = express.Router();

router.use(bodyParser());

router.post('/', (req, res) => {
    const userRegistration = new UserDAO();
    userRegistration.createNewUser(req.body.username, req.body.email, req.body.firstName, req.body.lastName)
        .then(() => {
            res.status(200).send({status: 200, data: {message: "New user added successfully"}});
        })
        .catch((err) => {
            res.status(400).send(err);
        });
});

export = router;
