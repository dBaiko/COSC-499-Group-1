/* tslint:disable:no-console */
import aws from "aws-sdk";
import {awsConfigPath} from "../../config/aws-config";

aws.config.loadFromPath(awsConfigPath);

interface Message {
    username: string;
    content: string;
}

const docClient = new aws.DynamoDB.DocumentClient();
const table = "Messages";

class MessageHandler {
    public addNewMessage(message: Message): void {
        const messageID = Date.now();
        const messageSort = messageID;
        console.log(messageID);
        const username = message.username;
        const content = message.content;
        const params = {
            Item:
                {
                    content,
                    messageID,
                    messageSort,
                    username,
                },
            TableName: table
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

export default MessageHandler;
