/* tslint:disable:no-console */
import aws from "aws-sdk";
import { awsConfigPath } from "../../config/aws-config";
import UserChannelDAO from "../userChannels/UserChannelDAO";
import { uuid } from "uuidv4";
import { DocumentClient, ItemList } from "aws-sdk/clients/dynamodb";

aws.config.loadFromPath(awsConfigPath);

const CHANNEL_TABLE_NAME: string = "Channel";

interface ChannelObject {
    channelId: string;
    channelName: string;
    channelType: string;
    channelDescription: string;
}

export interface ChannelAndNumUsers extends ChannelObject {
    numUsers?: number;
}

export interface UserChannelObject {
    username: string;
    channelId: string;
    userChannelRole: string;
    channelName: string;
    channelType: string;
    profileImage: string;
    statusText: string;
}

class ChannelDAO {
    private channelIdQueryDeclaration = "channelId = :channelId";

    constructor(private docClient: DocumentClient) {
    }

    public getChannelInfo(channelId: string): Promise<ChannelObject> {
        const params = {
            TableName: CHANNEL_TABLE_NAME,
            KeyConditionExpression: this.channelIdQueryDeclaration,
            ExpressionAttributeValues: {
                ":channelId": channelId
            }
        };

        return new Promise<any>((resolve, reject) => {
            this.docClient.query(params, (err, data) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    console.log("Query for " + channelId + " Succeeded");
                    resolve(data.Items[0]);
                }
            });
        });
    }

    public getAllChannels(): Promise<any> {
        const params = {
            TableName: CHANNEL_TABLE_NAME
        };

        return new Promise((resolve, reject) => {
            this.docClient.scan(params, (err, data) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    console.log("Query Succeeded");
                    let channels: ItemList = data.Items;
                    let userChannelDAO: UserChannelDAO = new UserChannelDAO(this.docClient);
                    let channelList: Array<ChannelAndNumUsers> = [];
                    let count: number = 0;
                    for (let channelItem of channels) {
                        let channel: ChannelAndNumUsers = {
                            channelId: channelItem.channelId as string,
                            channelName: channelItem.channelName as string,
                            channelType: channelItem.channelType as string,
                            channelDescription: channelItem.channelDescription as string
                        };
                        userChannelDAO
                            .getAllSubscribedUsers(channel.channelId)
                            .then((data: Array<UserChannelObject>) => {
                                channel.numUsers = data.length;
                                channelList.push(channel);
                                count++;
                                if (count == channels.length) {
                                    resolve(channelList.sort((a, b) => (a.numUsers > b.numUsers ? -1 : 1)));
                                }
                            })
                            .catch((err) => {
                                console.error(err);
                            });
                    }
                }
            });
        });
    }

    public addNewChannel(
        channelName: string,
        channelType: string,
        channelDescription: string,
        firstUsername: string,
        firstUserChannelRole: string,
        inviteStatus: string,
        profileImage: string
    ): Promise<any> {
        const userChannelDAO = new UserChannelDAO(this.docClient);
        const channelId = uuid();

        if (inviteStatus == null || inviteStatus == "") {
            inviteStatus = " ";
        }

        if (channelDescription == null || channelDescription == "") {
            channelDescription = " ";
        }

        const params = {
            Item: {
                channelId,
                channelName,
                channelType,
                channelDescription,
                inviteStatus
            },
            TableName: CHANNEL_TABLE_NAME
        };
        return new Promise((resolve, reject) => {
            this.docClient.put(params, (err, data) => {
                if (err) {
                    console.error("Unable to add new channel. Error JSON: ", JSON.stringify(err, null, 2));
                    reject(err);
                } else {
                    console.log("Added new:", JSON.stringify(data, null, 2));
                    userChannelDAO
                        .addNewUserToChannel(
                            firstUsername,
                            channelId,
                            firstUserChannelRole,
                            channelName,
                            channelType,
                            profileImage
                        )
                        .then(() => {
                            resolve(params.Item);
                        })
                        .catch((err) => {
                            reject(err);
                        });
                }
            });
        });
    }

    public updateChannel(
        channelId: string,
        channelName: string,
        channelType: string,
        channelDescription: string
    ): Promise<any> {
        const params = {
            TableName: CHANNEL_TABLE_NAME,
            Key: {
                channelId: channelId,
                channelName: channelName
            },
            UpdateExpression: "SET channelDescription = :d, channelType = :t",
            ExpressionAttributeValues: {
                ":t": channelType,
                ":d": channelDescription
            }
        };

        console.log("Updating channel " + channelId + "...");
        return new Promise((resolve, reject) => {
            this.docClient.update(params, (err, data) => {
                if (err) {
                    console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 4));
                    reject();
                } else {
                    console.log("Item updated successfully:", JSON.stringify(data, null, 4));
                    resolve();
                }
            });
        });
    }

    public updateChannelInviteStatus(channelId: string, channelName: string, inviteStatus: string): Promise<any> {
        const params = {
            TableName: CHANNEL_TABLE_NAME,
            Key: {
                channelId: channelId,
                channelName: channelName
            },
            UpdateExpression: "SET inviteStatus = :i",
            ExpressionAttributeValues: {
                ":i": inviteStatus
            }
        };

        console.log("Updating settings for user " + channelId + "...");
        return new Promise((resolve, reject) => {
            this.docClient.update(params, (err, data) => {
                if (err) {
                    console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 4));
                    reject();
                } else {
                    console.log("Item updated successfully:", JSON.stringify(data, null, 4));
                    resolve();
                }
            });
        });
    }

    public deleteChannel(channelId: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.getChannelInfo(channelId)
                .then((data: ChannelObject) => {
                    let deleteObject = {
                        TableName: CHANNEL_TABLE_NAME,
                        Key: {
                            channelId: channelId,
                            channelName: data.channelName
                        },
                        ConditionExpression: "channelId = :id and channelName = :n",
                        ExpressionAttributeValues: {
                            ":id": channelId,
                            ":n": data.channelName
                        }
                    };

                    this.docClient.delete(deleteObject, (err, data) => {
                        if (err) {
                            console.log(err);
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                })
                .catch((err) => {
                    console.log(err);
                    reject(err);
                });
        });
    }
}

export default ChannelDAO;
