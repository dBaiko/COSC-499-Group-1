/* tslint:disable:no-console */

import { DocumentClient } from "aws-sdk/clients/dynamodb";
import ChannelDAO from "../channels/ChannelDAO";
import MessageDAO from "../messages/MessageDAO";

const USER_CHANNEL_TABLE_NAME = "UserChannel";
const CHANNELID_USERNAME_INDEX = "channelId-username-index";
const PROFILE_IMAGE_S3_PREFIX: string =
    "https://streamline-athletes-messaging-app.s3.ca-central-1.amazonaws.com/user-profile-images/";

interface UserChannelObject {
    username: string;
    channelId: string;
    userChannelRole: string;
    channelName: string;
    channelType: string;
    profileImage: string;
}

class UserChannelDAO {
    private channelIdQueryDeclaration = "channelId = :channelId";
    private usernameQueryDeclaration = "username = :username";

    constructor(private docClient: DocumentClient) {
    }

    public getAll(): Promise<any> {
        const params = {
            TableName: USER_CHANNEL_TABLE_NAME
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

    public addNewUserToChannel(
        username: string,
        channelId: string,
        userChannelRole: string,
        channelName: string,
        channelType: string,
        profileImage: string
    ): Promise<any> {
        const params = {
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

        return new Promise((resolve, reject) => {
            this.docClient.put(params, (err, data) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    console.log("Added new user subsription: ", JSON.stringify(data, null, 2));
                    resolve();
                }
            });
        });
    }

    public getAllSubscribedChannels(username: string): Promise<any> {
        const params = {
            TableName: USER_CHANNEL_TABLE_NAME,
            KeyConditionExpression: this.usernameQueryDeclaration,
            ExpressionAttributeValues: {
                ":username": username
            }
        };

        return new Promise((resolve, reject) => {
            this.docClient.query(params, (err, data) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    console.log("Query for " + username + " Succeeded");
                    resolve(data.Items);
                }
            });
        });
    }

    public getAllSubscribedUsers(channelId: string): Promise<any> {
        const params = {
            TableName: USER_CHANNEL_TABLE_NAME,
            IndexName: CHANNELID_USERNAME_INDEX,
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
                    console.log("Query for " + channelId + " Succeeded");
                    resolve(data.Items);
                }
            });
        });
    }

    public deleteChannelSubscription(username: string, channelId: string): Promise<any> {
        const deleteObject = {
            TableName: USER_CHANNEL_TABLE_NAME,
            Key: {
                username: username,
                channelId: channelId
            },
            ConditionExpression: "username = :u and channelId = :c",
            ExpressionAttributeValues: {
                ":u": username,
                ":c": channelId
            }
        };

        return new Promise<any>((resolve, reject) => {
            this.docClient.delete(deleteObject, (err, data) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    console.log("Deleted user subscription successfully");
                    this.getAllSubscribedUsers(channelId)
                        .then((data: Array<UserChannelObject>) => {
                            if (data.length == 0) {
                                console.log("No more users in: " + channelId + " deleting channel");
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
                            console.log(err);
                            reject(err);
                        });
                }
            });
        });
    }

    public updateProfilePicture(username: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.getAllSubscribedChannels(username)
                .then((data: Array<UserChannelObject>) => {
                    data.forEach((userChannel) => {
                        let params = {
                            TableName: USER_CHANNEL_TABLE_NAME,
                            Key: {
                                username: username,
                                channelId: userChannel.channelId
                            },
                            UpdateExpression: "SET profileImage = :p",
                            ExpressionAttributeValues: {
                                ":p": PROFILE_IMAGE_S3_PREFIX + username + ".png"
                            }
                        };

                        this.docClient.update(params, (err, data1) => {
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

    public updateStatus(username: string, status: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.getAllSubscribedChannels(username)
                .then((data: Array<UserChannelObject>) => {
                    data.forEach((userChannel) => {
                        let params = {
                            TableName: USER_CHANNEL_TABLE_NAME,
                            Key: {
                                username: username,
                                channelId: userChannel.channelId
                            },
                            UpdateExpression: "SET statusText = :s",
                            ExpressionAttributeValues: {
                                ":s": status
                            }
                        };

                        this.docClient.update(params, (err, data1) => {
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
}

export default UserChannelDAO;
