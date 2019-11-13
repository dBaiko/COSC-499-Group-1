import express from 'express';
import userRegistration from "./users/registerUser";
const router = express.Router();

router.use('/users/registerUser', userRegistration);

export = router;
