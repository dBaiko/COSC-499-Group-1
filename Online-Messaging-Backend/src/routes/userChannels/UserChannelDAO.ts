import { DocumentClient, QueryOutput, ScanOutput } from "aws-sdk/clients/dynamodb";
import { ChannelDAO } from "../channels/ChannelDAO";
import { MessageDAO } from "../messages/MessageDAO";
import { Constants, UserChannelObject } from "../../config/app-config";
import { AWSError } from "aws-sdk";

const USER_CHANNEL_TABLE_NAME = "UserChannel";
const CHANNEL_ID_USERNAME_INDEX = "channelId-username-index";
const PROFILE_IMAGE_S3_PREFIX: string =
    "https://streamline-athletes-messaging-app.s3.ca-central-1.amazonaws.com/user-profile-images/";

const CHANNEL_ID_QUERY = "channelId = :channelId";
const USERNAME_QUERY = "username = :username";
const USERNAME_AND_CHANNEL_ID_QUERY = "username = :u and channelId = :c";
const PROFILE_IMAGE_UPDATE_EXPRESSION = "SET profileImage = :p";
const STATUS_TEXT_UPDATE_EXPRESSION = "SET statusText = :s";
const USER_CHANNEL_ROLE_UPDATE_EXPRESSION = "SET userChannelRole = :r";

const USER_CHANNEL_ROLE_TYPE = "user";
const BANNED_CHANNEL_ROLE_TYPE = "banned";

export class UserChannelDAO {
    constructor(private docClient: DocumentClient) {
    }

    public getAll(): Promise<Array<UserChannelObject>> {
        let params = {
            TableName: USER_CHANNEL_TABLE_NAME
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

    public addNewUserToChannel(
        username: string,
        channelId: string,
        userChannelRole: string,
        channelName: string,
        channelType: string,
        profileImage: string
    ): Promise<void> {
        let params = {
            Item: {
                username,
                channelId,
                userChannelRole,
                channelName,
                channelType,
                profileImage
            },
            TableName: USER_CHANNEL_TABLE_NAME
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

    public getAllSubscribedChannels(username: string): Promise<Array<UserChannelObject>> {
        let params = {
            TableName: USER_CHANNEL_TABLE_NAME,
            KeyConditionExpression: USERNAME_QUERY,
            ExpressionAttributeValues: {
                ":username": username
            }
        };

        return new Promise<any>((resolve, reject) => {
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

    public getAllSubscribedUsers(channelId: string): Promise<Array<UserChannelObject>> {
        let params = {
            TableName: USER_CHANNEL_TABLE_NAME,
            IndexName: CHANNEL_ID_USERNAME_INDEX,
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
                    resolve(data.Items);
                }
            });
        });
    }

    public deleteChannelSubscription(username: string, channelId: string): Promise<void> {
        const deleteObject = {
            TableName: USER_CHANNEL_TABLE_NAME,
            Key: {
                username: username,
                channelId: channelId
            },
            ConditionExpression: USERNAME_AND_CHANNEL_ID_QUERY,
            ExpressionAttributeValues: {
                ":u": username,
                ":c": channelId
            }
        };

        return new Promise<void>((resolve, reject) => {
            this.docClient.delete(deleteObject, (err: AWSError) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    this.getAllSubscribedUsers(channelId)
                        .then((data: Array<UserChannelObject>) => {
                            if (data.length == 0) {
                                let channelDAO = new ChannelDAO(this.docClient);
                                channelDAO
                                    .deleteChannel(channelId)
                                    .then(() => {
                                        let messageDAO = new MessageDAO(this.docClient);
                                        messageDAO.deleteAllMessagesForChannel(channelId);
                                        resolve();
                                    })
                                    .catch((err) => {
                                        reject(err);
                                    });
                            } else {
                                resolve();
                            }
                        })
                        .catch((err) => {
                            console.error(err);
                            reject(err);
                        });
                }
            });
        });
    }

    public updateProfilePicture(username: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.getAllSubscribedChannels(username)
                .then((data: Array<UserChannelObject>) => {
                    data.forEach((userChannel) => {
                        let params = {
                            TableName: USER_CHANNEL_TABLE_NAME,
                            Key: {
                                username: username,
                                channelId: userChannel.channelId
                            },
                            UpdateExpression: PROFILE_IMAGE_UPDATE_EXPRESSION,
                            ExpressionAttributeValues: {
                                ":p": PROFILE_IMAGE_S3_PREFIX + username + Constants.PNG_FILE_FORMAT
                            }
                        };

                        this.docClient.update(params, (err: AWSError) => {
                            if (err) {
                                reject(err);
                            }
                        });
                    });
                    resolve();
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    public updateStatus(username: string, status: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.getAllSubscribedChannels(username)
                .then((data: Array<UserChannelObject>) => {
                    data.forEach((userChannel: UserChannelObject) => {
                        let params = {
                            TableName: USER_CHANNEL_TABLE_NAME,
                            Key: {
                                username: username,
                                channelId: userChannel.channelId
                            },
                            UpdateExpression: STATUS_TEXT_UPDATE_EXPRESSION,
                            ExpressionAttributeValues: {
                                ":s": status
                            }
                        };

                        this.docClient.update(params, (err: AWSError) => {
                            if (err) {
                                reject(err);
                            }
                        });
                    });
                    resolve();
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    public banUser(channelId: string, username: string): Promise<void> {
        let params = {
            TableName: USER_CHANNEL_TABLE_NAME,
            Key: {
                channelId: channelId,
                username: username
            },
            UpdateExpression: USER_CHANNEL_ROLE_UPDATE_EXPRESSION,
            ExpressionAttributeValues: {
                ":r": BANNED_CHANNEL_ROLE_TYPE
            }
        };

        return new Promise<void>((resolve, reject) => {
            this.docClient.update(params, (err: AWSError) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    public unBanUser(channelId: string, username: string): Promise<void> {
        let params = {
            TableName: USER_CHANNEL_TABLE_NAME,
            Key: {
                channelId: channelId,
                username: username
            },
            UpdateExpression: USER_CHANNEL_ROLE_UPDATE_EXPRESSION,
            ExpressionAttributeValues: {
                ":r": USER_CHANNEL_ROLE_TYPE
            }
        };

        return new Promise<void>((resolve, reject) => {
            this.docClient.update(params, (err: AWSError) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}
