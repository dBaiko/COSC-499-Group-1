import { DocumentClient } from "aws-sdk/clients/dynamodb";

export interface ReactionObject {
    messageId: string,
    emoji: string,
    insertTime: number,
    username: string
}

const REACTIONS_TABLE_NAME = "Reactions";

class ReactionsDAO {

    constructor(private docClient: DocumentClient) {
    }

    public getAllReactionsForMessage(messageId: string): Promise<any> {
        let params = {
            TableName: REACTIONS_TABLE_NAME,
            KeyConditionExpression: "messageId = :m",
            ExpressionAttributeValues: {
                ":m": messageId
            }
        };

        return new Promise<any>((resolve, reject) => {
            this.docClient.query(params, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data.Items);
                }
            });
        });

    }

    public addNewReaction(messageId: string, emoji: string, username: string): Promise<any> {
        let params = {
            Item: {
                messageId: messageId,
                emoji: emoji,
                insertTime: Date.now(),
                username: username
            },
            TableName: REACTIONS_TABLE_NAME
        };

        return new Promise<any>((resolve, reject) => {
                this.docClient.put(params, (err, data) => {
                    if (err) {
                        console.log(err);
                        reject(err);
                    } else {
                        console.log("added new reaction successfully");
                        resolve();
                    }
                });
            }
        );

    }

    public deleteReactionForMessage(messageId: string, emoji: string, username: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
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
                            ConditionExpression: "messageId = :m and insertTime = :i",
                            ExpressionAttributeValues: {
                                ":m": toDelete.messageId,
                                ":i": toDelete.insertTime
                            }
                        };

                        this.docClient.delete(params, (err, data1) => {
                            if (err) {
                                console.log(err);
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

    public deleteAllReactionsForMessage(messageId: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.getAllReactionsForMessage(messageId)
                .then((data: Array<ReactionObject>) => {
                    for (let item of data) {

                        let params = {
                            TableName: REACTIONS_TABLE_NAME,
                            Key: {
                                messageId: item.messageId,
                                insertTime: item.insertTime
                            },
                            ConditionExpression: "messageId = :m, and insertTime = :i",
                            ExpressionAttributeValues: {
                                ":m": messageId,
                                ":i": item.insertTime
                            }
                        };

                        this.docClient.delete(params, (err, data1) => {
                            if (err) {
                                console.log(err);
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

export default ReactionsDAO;
