/* tslint:disable:no-console */
import aws from "aws-sdk";
import {awsConfigPath} from "../../config/aws-config";

aws.config.loadFromPath(awsConfigPath);

const docClient = new aws.DynamoDB.DocumentClient();

const table = "Users";

class UserDAO {

    public createNewUser(username: string, email: string, firstName: string, lastName: string): Promise<any> {
        const params = {
            Item: {
                email,
                firstName,
                lastName,
                username,
            },
            TableName: table
        };

        return new Promise((resolve, reject) => {
            docClient.put(params, (err, data) => {
                if (err) {
                    console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
                    reject(err);
                } else {
                    console.log("Added item:", JSON.stringify(data, null, 2));
                    resolve();
                }
            });
        });

    }

}

export default UserDAO;
