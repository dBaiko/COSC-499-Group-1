"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const UserRegistration_1 = __importDefault(require("./UserRegistration"));
const router = express_1.default.Router();
router.use(body_parser_1.default());
router.post('/', (req, res) => {
    const userRegistration = new UserRegistration_1.default();
    userRegistration.createNewUser(req.body.username, req.body.email, req.body.firstName, req.body.lastName);
    res.status(200).send("New User added successfully");
});
module.exports = router;
//# sourceMappingURL=registerUser.js.map