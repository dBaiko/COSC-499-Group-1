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

interface Message {
    channelId: number;
    username: string;
    content: string;
}

const tableName = "Messages";

class MessageDAO {

    public getMessageHistory(channelId: number): Promise<any> {
        const params = {
            TableName: tableName,
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
            TableName: tableName,
        };

        return new Promise((resolve, reject) => {
            docClient.scan(params, (err, data) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    console.log("Query Succeeded");
                    resolve(data.Items);
                }
            });

        });

    }

    public addNewMessage(message: Message): void {
        const channelId = Number(message.channelId);
        const messageId = Date.now();
        console.log(messageId);
        const username = message.username;
        const content = message.content;
        const params = {
            Item:
                {
                    channelId,
                    content,
                    messageId,
                    username,
                },
            TableName: tableName
        };

        docClient.put(params, (err, data) => {
            if (err) {
                console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                console.log("Added new message:", JSON.stringify(data, null, 2));
            }
        });
    }

}

export default MessageDAO;
