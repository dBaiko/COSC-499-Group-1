/* tslint:disable:no-console */
import aws from "aws-sdk";
import {awsConfigPath} from "../../config/aws-config";

aws.config.loadFromPath(awsConfigPath);

const docClient = new aws.DynamoDB.DocumentClient();

const table = "Users";

class UserRegistration {

    public createNewUser(username: string, email: string, firstName: string, lastName: string): void {
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
            } else {
                console.log("Added item:", JSON.stringify(data, null, 2));
            }
        });

    }

}

export default UserRegistration;
