import { DocumentClient, QueryOutput } from "aws-sdk/clients/dynamodb";
import { ReactionObject } from "../../config/app-config";
import { AWSError } from "aws-sdk";

const REACTIONS_TABLE_NAME = "Reactions";
const MESSAGE_QUERY = "messageId = :m";
const MESSAGE_CONDITION_EXPRESSION = "messageId = :m and insertTime = :i";

export class ReactionsDAO {
    constructor(private docClient: DocumentClient) {
    }

    public getAllReactionsForMessage(messageId: string): Promise<Array<ReactionObject>> {
        let params = {
            TableName: REACTIONS_TABLE_NAME,
            KeyConditionExpression: MESSAGE_QUERY,
            ExpressionAttributeValues: {
                ":m": messageId
            }
        };

        return new Promise<any>((resolve, reject) => {
            this.docClient.query(params, (err: AWSError, data: QueryOutput) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data.Items);
                }
            });
        });
    }

    public addNewReaction(messageId: string, emoji: string, username: string): Promise<void> {
        let params = {
            Item: {
                messageId: messageId,
                emoji: emoji,
                insertTime: Date.now(),
                username: username
            },
            TableName: REACTIONS_TABLE_NAME
        };

        return new Promise<void>((resolve, reject) => {
            this.docClient.put(params, (err: AWSError) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    public deleteReactionForMessage(messageId: string, emoji: string, username: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.getAllReactionsForMessage(messageId)
                .then((data: Array<ReactionObject>) => {
                    let toDelete: ReactionObject;
                    for (let item of data) {
                        if (item.emoji == emoji && item.username == username) {
                            toDelete = item;
                            break;
                        }
                    }
                    if (toDelete) {
                        let params = {
                            TableName: REACTIONS_TABLE_NAME,
                            Key: {
                                messageId: toDelete.messageId,
                                insertTime: toDelete.insertTime
                            },
                            ConditionExpression: MESSAGE_CONDITION_EXPRESSION,
                            ExpressionAttributeValues: {
                                ":m": toDelete.messageId,
                                ":i": toDelete.insertTime
                            }
                        };

                        this.docClient.delete(params, (err: AWSError) => {
                            if (err) {
                                console.error(err);
                                reject(err);
                            } else {
                                resolve();
                            }
                        });
                    }
                    resolve();
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    public deleteAllReactionsForMessage(messageId: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.getAllReactionsForMessage(messageId)
                .then((data: Array<ReactionObject>) => {
                    for (let item of data) {
                        let params = {
                            TableName: REACTIONS_TABLE_NAME,
                            Key: {
                                messageId: item.messageId,
                                insertTime: item.insertTime
                            },
                            ConditionExpression: MESSAGE_CONDITION_EXPRESSION,
                            ExpressionAttributeValues: {
                                ":m": messageId,
                                ":i": item.insertTime
                            }
                        };

                        this.docClient.delete(params, (err: AWSError) => {
                            if (err) {
                                console.error(err);
                                reject(err);
                            }
                        });
                    }
                    resolve();
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }
}
