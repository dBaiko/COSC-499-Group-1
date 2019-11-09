"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const helmet_csp_1 = __importDefault(require("helmet-csp"));
const cspComponent = helmet_csp_1.default({
    directives: {
        defaultSrc: [`'self'`],
        imgSrc: [`'self'`]
    }
});
module.exports = cspComponent;
//# sourceMappingURL=csp-component.js.map