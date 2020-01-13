/* tslint:disable:no-console */
import bodyParser from "body-parser";
import express from 'express';
import MessageDAO from "./MessageDAO";

const router = express.Router();

router.use(bodyParser());

router.get('/', (req, res) => {
    const messageDAO = new MessageDAO();
    const response = messageDAO.getMessageHistory()
        .then((data) => {
            res.status(200).send(data);
        })
        .catch((err) => {
            res.status(400).send(err);
        });
});

export = router;
