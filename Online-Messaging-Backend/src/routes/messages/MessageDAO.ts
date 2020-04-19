import { DocumentClient, QueryOutput, ScanOutput } from "aws-sdk/clients/dynamodb";
import { ReactionsDAO } from "../reactions/ReactionsDAO";
import { sanitizeInput } from "../../index";
import { Message } from "../../config/app-config";
import { AWSError } from "aws-sdk";
import {
    ADMIN_TRUE_VALUE,
    CHANNEL_ID_AND_INSERT_TIME_CONDITION_EXPRESSION,
    CHANNEL_ID_QUERY,
    CONTENT_UPDATE_EXPRESSION,
    DELETED_UPDATE_EXPRESSION,
    MESSAGE_ID_CONDITION_EXPRESSION,
    tableName,
    TRUE_VALUE
} from "./Messages_Constants";

export class MessageDAO {
    constructor(private docClient: DocumentClient) {
    }

    public getMessageHistory(channelId: string): Promise<any> {
        let params = {
            TableName: tableName,
            KeyConditionExpression: CHANNEL_ID_QUERY,
            ScanIndexForward: true,
            ExpressionAttributeValues: {
                ":channelId": channelId
            }
        };

        return new Promise((resolve, reject) => {
            this.docClient.query(params, (err: AWSError, data: QueryOutput) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve(data.Items);
                }
            });
        });
    }

    public getAllMessageHistory(): Promise<Array<Message>> {
        let params = {
            TableName: tableName
        };

        return new Promise<any>((resolve, reject) => {
            this.docClient.scan(params, (err: AWSError, data: ScanOutput) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
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
        let params = {
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

        this.docClient.put(params, (err: AWSError) => {
            if (err) {
                console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 4));
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
                        ConditionExpression: CHANNEL_ID_AND_INSERT_TIME_CONDITION_EXPRESSION,
                        UpdateExpression: DELETED_UPDATE_EXPRESSION,
                        ExpressionAttributeValues: {
                            ":c": channelId,
                            ":i": data[i].insertTime,
                            ":m": true
                        }
                    };

                    this.docClient.update(updateObject, (err: AWSError) => {
                        if (err) {
                            console.error(err);
                        }
                    });
                }
            })
            .catch((err) => {
                console.error(err);
            });
    }

    public updateMessage(message: Message): Promise<void> {
        message.channelId = sanitizeInput(message.channelId);
        message.channelType = sanitizeInput(message.channelType);
        message.username = sanitizeInput(message.username);
        message.content = sanitizeInput(message.content);
        message.profileImage = sanitizeInput(message.content);
        return new Promise<void>((resolve, reject) => {
            let updateObject = {
                TableName: tableName,
                Key: {
                    channelId: message.channelId,
                    insertTime: message.insertTime
                },
                UpdateExpression: CONTENT_UPDATE_EXPRESSION,
                ConditionExpression: MESSAGE_ID_CONDITION_EXPRESSION,
                ExpressionAttributeValues: {
                    ":i": message.messageId,
                    ":c": message.content
                }
            };

            this.docClient.update(updateObject, (err: AWSError) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    public deleteMessage(messageId: string, channelId: string, insertTime: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let updateObject = {
                TableName: tableName,
                Key: {
                    channelId: channelId,
                    insertTime: insertTime
                },
                UpdateExpression: DELETED_UPDATE_EXPRESSION,
                ConditionExpression: MESSAGE_ID_CONDITION_EXPRESSION,
                ExpressionAttributeValues: {
                    ":m": TRUE_VALUE,
                    ":i": messageId
                }
            };

            this.docClient.update(updateObject, (err: AWSError) => {
                if (err) {
                    console.error(err);
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

    public adminDeleteMessage(messageId: string, channelId: string, insertTime: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let updateObject = {
                TableName: tableName,
                Key: {
                    channelId: channelId,
                    insertTime: insertTime
                },
                UpdateExpression: DELETED_UPDATE_EXPRESSION,
                ConditionExpression: MESSAGE_ID_CONDITION_EXPRESSION,
                ExpressionAttributeValues: {
                    ":m": ADMIN_TRUE_VALUE,
                    ":i": messageId
                }
            };

            this.docClient.update(updateObject, (err: AWSError) => {
                if (err) {
                    console.error(err);
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
