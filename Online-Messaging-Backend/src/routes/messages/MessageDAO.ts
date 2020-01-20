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

    public getMessageHistory(channelId: number): Promise<any> {
        const params = {
            TableName: 'Messages',
            KeyConditionExpression: "channelId = :channelId",
            ExpressionAttributeValues: {
                ":channelId": channelId
            }
        };

        return new Promise((resolve, reject) => {
            docClient.query(params, (err, data) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    console.log("Query for " + channelId + " Succeeded");
                    resolve(data.Items);
                }
            });

        });

    }

    public getAllMessageHistory(): Promise<any> {
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
                    resolve(data.Items.sort(
                        (a: MessageObject, b: MessageObject) => (a.messageID > b.messageID) ? 1 : -1));
                }
            });
        });

    }

}

export default MessageDAO;
