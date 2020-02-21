import bodyParser from "body-parser";
import express from "express";
import ProfileDAO from "./ProfileDAO";

const router = express.Router();

router.use(bodyParser());

router.post("/", (req, res) => {
    const defaultProfile = new ProfileDAO();
    defaultProfile
        .createProfileFromUser(req.body.username, req.body.email, req.body.firstName, req.body.lastName)
        .then(() => {
            res.status(200).send({ status: 200, data: { message: "New profile created successfully" } });
        })
        .catch((err) => {
            res.status(400).send(err);
        });
});

router.put("/", (req, res) => {
    const updateProfile = new ProfileDAO();
    updateProfile
        .updateProfile(
            req.body.username,
            req.body.email,
            req.body.firstName,
            req.body.lastName,
            req.body.age,
            req.body.school,
            req.body.activities,
            req.body.gender,
            req.body.bio
        )
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

router.get("/", (req, res) => {
    const getProfile = new ProfileDAO();
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
