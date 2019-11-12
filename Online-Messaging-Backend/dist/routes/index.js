"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const registerUser_1 = __importDefault(require("./users/registerUser"));
const router = express_1.default.Router();
router.use('/users/registerUser', registerUser_1.default);
module.exports = router;
//# sourceMappingURL=index.js.map