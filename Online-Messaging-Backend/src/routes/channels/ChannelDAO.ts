import aws, { AWSError } from "aws-sdk";
import { awsConfigPath } from "../../config/aws-config";
import { UserChannelDAO } from "../userChannels/UserChannelDAO";
import { uuid } from "uuidv4";
import { DocumentClient, ItemList, QueryOutput, ScanOutput } from "aws-sdk/clients/dynamodb";
import { ChannelAndNumUsers, ChannelObject, Constants, UserChannelObject } from "../../config/app-config";
import {
    CHANNEL_DESC_AND_TYPE_UPDATE_EXPRESSION,
    CHANNEL_ID_AND_NAME_CONDITION_EXPRESSION,
    CHANNEL_ID_QUERY,
    CHANNEL_TABLE_NAME,
    INVITE_STATUS_UPDATE_EXPRESSION
} from "./Channels_Constants";

aws.config.loadFromPath(awsConfigPath);

export class ChannelDAO {
    constructor(private docClient: DocumentClient) {
    }

    public getChannelInfo(channelId: string): Promise<ChannelObject> {
        let params = {
            TableName: CHANNEL_TABLE_NAME,
            KeyConditionExpression: CHANNEL_ID_QUERY,
            ExpressionAttributeValues: {
                ":channelId": channelId
            }
        };

        return new Promise<any>((resolve, reject) => {
            this.docClient.query(params, (err: AWSError, data: QueryOutput) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve(data.Items[0]);
                }
            });
        });
    }

    public getAllChannels(): Promise<Array<ChannelObject>> {
        let params = {
            TableName: CHANNEL_TABLE_NAME
        };

        return new Promise<any>((resolve, reject) => {
            this.docClient.scan(params, (err: AWSError, data: ScanOutput) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
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
                                    resolve(
                                        channelList.sort((a: ChannelAndNumUsers, b: ChannelAndNumUsers) =>
                                            a.numUsers > b.numUsers ? -1 : 1
                                        )
                                    );
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
    ): Promise<ChannelObject> {
        const userChannelDAO = new UserChannelDAO(this.docClient);
        const channelId = uuid();

        if (inviteStatus == null || inviteStatus == Constants.EMPTY) {
            inviteStatus = Constants.SPACE;
        }

        if (channelDescription == null || channelDescription == Constants.EMPTY) {
            channelDescription = Constants.SPACE;
        }

        let params = {
            Item: {
                channelId,
                channelName,
                channelType,
                channelDescription,
                inviteStatus
            },
            TableName: CHANNEL_TABLE_NAME
        };
        return new Promise<any>((resolve, reject) => {
            this.docClient.put(params, (err: AWSError) => {
                if (err) {
                    console.error("Unable to add new channel. Error JSON: ", JSON.stringify(err, null, 2));
                    reject(err);
                } else {
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
    ): Promise<void> {
        let params = {
            TableName: CHANNEL_TABLE_NAME,
            Key: {
                channelId: channelId,
                channelName: channelName
            },
            UpdateExpression: CHANNEL_DESC_AND_TYPE_UPDATE_EXPRESSION,
            ExpressionAttributeValues: {
                ":t": channelType,
                ":d": channelDescription
            }
        };

        return new Promise<void>((resolve, reject) => {
            this.docClient.update(params, (err: AWSError) => {
                if (err) {
                    console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 4));
                    reject();
                } else {
                    resolve();
                }
            });
        });
    }

    public updateChannelInviteStatus(channelId: string, channelName: string, inviteStatus: string): Promise<void> {
        let params = {
            TableName: CHANNEL_TABLE_NAME,
            Key: {
                channelId: channelId,
                channelName: channelName
            },
            UpdateExpression: INVITE_STATUS_UPDATE_EXPRESSION,
            ExpressionAttributeValues: {
                ":i": inviteStatus
            }
        };

        return new Promise<void>((resolve, reject) => {
            this.docClient.update(params, (err: AWSError) => {
                if (err) {
                    console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 4));
                    reject();
                } else {
                    resolve();
                }
            });
        });
    }

    public deleteChannel(channelId: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.getChannelInfo(channelId)
                .then((data: ChannelObject) => {
                    let deleteObject = {
                        TableName: CHANNEL_TABLE_NAME,
                        Key: {
                            channelId: channelId,
                            channelName: data.channelName
                        },
                        ConditionExpression: CHANNEL_ID_AND_NAME_CONDITION_EXPRESSION,
                        ExpressionAttributeValues: {
                            ":id": channelId,
                            ":n": data.channelName
                        }
                    };

                    this.docClient.delete(deleteObject, (err: AWSError) => {
                        if (err) {
                            console.error(err);
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                })
                .catch((err) => {
                    console.error(err);
                    reject(err);
                });
        });
    }
}
