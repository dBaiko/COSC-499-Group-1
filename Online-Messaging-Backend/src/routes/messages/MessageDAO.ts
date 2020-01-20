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
            KeyConditionExpression: "channelId = :channelId",
            ExpressionAttributeValues: {
                ":channelId": 0
            }
        };

        return new Promise((resolve, reject) => {
            docClient.query(params, (err, data) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    console.log("Query Succeeded");
                    console.log(data);
                    resolve(data.Items);
                }
            });

        });

    }

}

export default MessageDAO;
