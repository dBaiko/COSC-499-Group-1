"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const csp_component_1 = __importDefault(require("./config/csp-component"));
const routes_1 = __importDefault(require("./routes"));
const app = express_1.default();
const port = 8080; // default port to listen
app.use(cors_1.default());
app.use(csp_component_1.default);
app.get("/", (req, res, next) => {
    res.send("Backend is up and running");
});
app.use('/', routes_1.default);
app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(`server started at http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map