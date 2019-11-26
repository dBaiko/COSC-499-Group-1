/* tslint:disable:no-console */
import aws from "aws-sdk";
import {awsConfigPath} from "../../config/aws-config";

aws.config.loadFromPath(awsConfigPath);

const docClient = new aws.DynamoDB.DocumentClient();

interface MessageObject {
    username: string;
    content: string;
    messageID: number;
}

class MessageDAO {

    public getMessageHistory(): Promise<any> {
        const params = {
            TableName: 'Messages',

        };

        return new Promise((resolve, reject) => {
            docClient.scan(params, (err, data) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    console.log("Query Succeeded");
                    console.log(data);
                    resolve(data.Items.sort(
                        (a: MessageObject, b: MessageObject) => (a.messageID > b.messageID) ? 1 : -1));
                }
            });
        });

    }

    // public createNewUser(username: string, email: string, firstName: string, lastName: string) {
    //     const params = {
    //         Item: {
    //             email,
    //             firstName,
    //             lastName,
    //             username,
    //         },
    //         TableName: table
    //     };
    //
    //     docClient.put(params, (err, data) => {
    //         if (err) {
    //             console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
    //         } else {
    //             console.log("Added item:", JSON.stringify(data, null, 2));
    //         }
    //     });
    //
    // }

}

export default MessageDAO;
