"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* tslint:disable:no-console */
const aws_sdk_1 = __importDefault(require("aws-sdk"));
aws_sdk_1.default.config.loadFromPath('src/config/aws-dynamodb-config.json');
const docClient = new aws_sdk_1.default.DynamoDB.DocumentClient();
const table = "Users";
class UserRegistration {
    createNewUser(username, email, firstName, lastName) {
        const params = {
            Item: {
                email,
                firstName,
                lastName,
                username,
            },
            TableName: table
        };
        docClient.put(params, (err, data) => {
            if (err) {
                console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
            }
            else {
                console.log("Added item:", JSON.stringify(data, null, 2));
            }
        });
    }
}
exports.default = UserRegistration;
//# sourceMappingURL=UserRegistration.js.map