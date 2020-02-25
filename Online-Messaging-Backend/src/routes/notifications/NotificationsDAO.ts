import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { UserSocket } from "../../index";

const NOTIFICATIONS_TABLE_NAME = "Notifications";
const NOTIFICATIONS_USER_INDEX = "username-insertedTime-index";
const NOTIFICATIONS_FRIENDS_INDEX = "fromFriend-username-index";
const NOTIFICATIONS_CHANNEL_INDEX = "channelId-insertedTime-index";

export interface NotificationDBObject {
    notificationId: string;
    insertedTime: number;
    username: string;
    channelId: string;
    channelName: string;
    type: string;
    message: string;
}

export interface NotificationObject {
    channelId: string;
    channelName: string;
    message: string;
    type: string;
    username: string;
    notificationId: string;
    insertedTime: number;
}

export interface NotificationSocketObject {
    fromUser: UserSocket;
    toUser: UserSocket;
    notification: NotificationObject;
}

export class NotificationsDAO {
    private usernameQueryDeclaration = "username = :username";
    private channelIdQueryDeclaration = "channelId = :channelId";
    private friendQueryDeclaration = "fromFriend = :fromFriend and username = :username";

    constructor(private docClient: DocumentClient) {
    }

    public getAllNotificationsForUser(username: string): Promise<any> {
        const params = {
            TableName: NOTIFICATIONS_TABLE_NAME,
            IndexName: NOTIFICATIONS_USER_INDEX,
            KeyConditionExpression: this.usernameQueryDeclaration,
            ExpressionAttributeValues: {
                ":username": username
            }
        };

        return new Promise<any>((resolve, reject) => {
            this.docClient.query(params, (err, data) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    console.log("Query for " + username + "'s notifications succeeded");
                    resolve(data.Items);
                }
            });
        });
    }

    public getAllFriendRequestsFromUser(fromFriend: string, username: string): Promise<any> {
        const params = {
            TableName: NOTIFICATIONS_TABLE_NAME,
            IndexName: NOTIFICATIONS_FRIENDS_INDEX,
            KeyConditionExpression: this.friendQueryDeclaration,
            ExpressionAttributeValues: {
                ":username": username,
                ":fromFriend": fromFriend
            }
        };

        return new Promise<any>((resolve, reject) => {
            this.docClient.query(params, (err, data) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    console.log("Query for " + username + "'s notifications succeeded");
                    resolve(data.Items);
                }
            });
        });
    }

    public getAllNotificationsForChannel(channelId: string): Promise<any> {
        const params = {
            TableName: NOTIFICATIONS_TABLE_NAME,
            IndexName: NOTIFICATIONS_CHANNEL_INDEX,
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
                    console.log("Query for " + channelId + "'s notifications succeeded");
                    resolve(data.Items);
                }
            });
        });
    }

    public socketCreateNewNotification(notificationSocketObject: NotificationSocketObject): Promise<any> {
        let notificationDBObject: NotificationDBObject = {
            notificationId: notificationSocketObject.notification.notificationId,
            insertedTime: notificationSocketObject.notification.insertedTime,
            username: notificationSocketObject.notification.username,
            channelId: notificationSocketObject.notification.channelId,
            channelName: notificationSocketObject.notification.channelName,
            type: notificationSocketObject.notification.type,
            message: notificationSocketObject.notification.message
        };

        const params = {
            Item: notificationDBObject,
            TableName: NOTIFICATIONS_TABLE_NAME
        };

        return new Promise<any>((resolve, reject) => {
            this.docClient.put(params, (err, data) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    console.log("Added new notification successfully");
                    resolve();
                }
            });
        });
    }

    public createNewNotification(notificationObject: NotificationObject): Promise<any> {
        let notificationDBObject: NotificationDBObject = {
            notificationId: notificationObject.notificationId,
            insertedTime: notificationObject.insertedTime,
            username: notificationObject.username,
            channelId: notificationObject.channelId,
            channelName: notificationObject.channelName,
            type: notificationObject.type,
            message: notificationObject.message
        };

        const params = {
            Item: notificationDBObject,
            TableName: NOTIFICATIONS_TABLE_NAME
        };

        return new Promise<any>((resolve, reject) => {
            this.docClient.put(params, (err, data) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    console.log("Added new notification successfully");
                    resolve();
                }
            });
        });
    }

    public deleteNotification(notificationId: string, insertedTime: number): Promise<any> {
        console.log(notificationId);
        const params = {
            TableName: NOTIFICATIONS_TABLE_NAME,
            Key: {
                notificationId: notificationId,
                insertedTime: insertedTime
            },
            ConditionExpression: "notificationId = :notificationId and insertedTime = :i",
            ExpressionAttributeValues: {
                ":notificationId": notificationId,
                ":i": insertedTime
            }
        };

        return new Promise<any>((resolve, reject) => {
            this.docClient.delete(params, (err, data) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    console.log("Successfully deleted item");
                    resolve();
                }
            });
        });
    }
}
