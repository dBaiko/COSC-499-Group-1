import bodyParser from "body-parser";
import express from 'express';
import UserRegistration from "./UserRegistration";
const router = express.Router();

router.use(bodyParser());

router.post('/', (req, res) => {
    const userRegistration = new UserRegistration();
    userRegistration.createNewUser(req.body.username, req.body.email, req.body.firstName, req.body.lastName);
    res.status(200).send({status: 200, data: {message: "New user added successfully"}});
});

export  = router;
