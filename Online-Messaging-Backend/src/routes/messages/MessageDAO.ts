/* tslint:disable:no-console */
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import ReactionsDAO from "../reactions/ReactionsDAO";
import { sanitizeInput } from "../../index";

export interface Message {
    channelId: string;
    username: string;
    content: string;
    messageId?: string;
    insertTime?: number;
    profileImage: string;
    deleted: string;
    channelType?: string;
}

interface ChannelObject {
    channelId: string;
    channelName: string;
    channelType: string;
}

const tableName: string = "Messages";

export class MessageDAO {
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
        const insertTime = message.insertTime;
        const messageId = message.messageId;
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
                    let updateObject = {
                        TableName: tableName,
                        Key: {
                            channelId: data[i].channelId,
                            insertTime: data[i].insertTime
                        },
                        ConditionExpression: "channelId = :c and insertTime = :i",
                        UpdateExpression: "SET deleted = :m",
                        ExpressionAttributeValues: {
                            ":c": channelId,
                            ":i": data[i].insertTime,
                            ":m": true
                        }
                    };

                    this.docClient.update(updateObject, (err, data1) => {
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

    public updateMessage(message: Message): Promise<any> {
        message.channelId = sanitizeInput(message.channelId);
        message.channelType = sanitizeInput(message.channelType);
        message.username = sanitizeInput(message.username);
        message.content = sanitizeInput(message.content);
        message.profileImage = sanitizeInput(message.content);
        return new Promise<any>((resolve, reject) => {
            let updateObject = {
                TableName: tableName,
                Key: {
                    channelId: message.channelId,
                    insertTime: message.insertTime
                },
                UpdateExpression: "SET content = :c",
                ConditionExpression: "messageId = :i",
                ExpressionAttributeValues: {
                    ":i": message.messageId,
                    ":c": message.content
                }
            };

            this.docClient.update(updateObject, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    console.log("message updated successfully");
                    resolve();
                }
            });
        });
    }

    public deleteMessage(messageId: string, channelId: string, insertTime: number): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            let updateObject = {
                TableName: tableName,
                Key: {
                    channelId: channelId,
                    insertTime: insertTime
                },
                UpdateExpression: "SET deleted = :m",
                ConditionExpression: "messageId = :i",
                ExpressionAttributeValues: {
                    ":m": true,
                    ":i": messageId
                }
            };

            this.docClient.update(updateObject, (err, data) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    let reactionsDAO: ReactionsDAO = new ReactionsDAO(this.docClient);
                    reactionsDAO
                        .deleteAllReactionsForMessage(messageId)
                        .then(() => {
                            resolve();
                        })
                        .catch((err) => {
                            reject(err);
                        });
                }
            });
        });
    }
}
