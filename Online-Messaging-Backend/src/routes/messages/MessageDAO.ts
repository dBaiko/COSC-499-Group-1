/* tslint:disable:no-console */
import { uuid } from "uuidv4";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

interface Message {
    channelId: number;
    username: string;
    content: string;
    insertTime: number;
    profileImage: string;
}

interface ChannelObject {
    channelId: string;
    channelName: string;
    channelType: string;
}

const tableName: string = "Messages";

class MessageDAO {
    private channelIdQueryDeclaration = "channelId = :channelId";

    constructor(private docClient: DocumentClient) {
    }

    public getMessageHistory(channelId: string): Promise<any> {
        const params = {
            TableName: tableName,
            KeyConditionExpression: this.channelIdQueryDeclaration,
            ExpressionAttributeValues: {
                ":channelId": channelId
            }
        };

        return new Promise((resolve, reject) => {
            this.docClient.query(params, (err, data) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    console.log("Query for " + channelId + "'s messages Succeeded");
                    resolve(data.Items);
                }
            });
        });
    }

    public getAllMessageHistory(): Promise<any> {
        const params = {
            TableName: tableName
        };

        return new Promise((resolve, reject) => {
            this.docClient.scan(params, (err, data) => {
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
        const channelId = message.channelId;
        const insertTime = Date.now();
        const messageId = uuid();
        const username = message.username;
        const content = message.content;
        const profileImage = message.profileImage;
        const params = {
            Item: {
                channelId,
                content,
                messageId,
                username,
                insertTime,
                profileImage
            },
            TableName: tableName
        };

        this.docClient.put(params, (err, data) => {
            if (err) {
                console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                console.log("Added new message:", JSON.stringify(data, null, 2));
            }
        });
    }

    public deleteAllMessagesForChannel(channelId: string): void {
        this.getMessageHistory(channelId)
            .then((data: Array<Message>) => {
                for (let i = 0; i < data.length; i++) {
                    let deleteObject = {
                        TableName: tableName,
                        Key: {
                            channelId: data[i].channelId,
                            insertTime: data[i].insertTime
                        },
                        ConditionExpression: "channelId = :c and insertTime = :i",
                        ExpressionAttributeValues: {
                            ":c": channelId,
                            ":i": data[i].insertTime
                        }
                    };

                    this.docClient.delete(deleteObject, (err, data1) => {
                        if (err) {
                            console.log(err);
                        }
                    });
                }
                console.log("All messages for " + channelId + " deleted successfully");
            })
            .catch((err) => {
                console.log(err);
            });
    }
}

export default MessageDAO;
