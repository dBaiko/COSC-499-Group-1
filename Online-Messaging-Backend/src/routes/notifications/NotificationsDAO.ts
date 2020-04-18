import { DocumentClient, QueryOutput } from "aws-sdk/clients/dynamodb";
import { NotificationDBObject, NotificationObject, NotificationSocketObject } from "../../config/app-config";
import { AWSError } from "aws-sdk";
import {
    CHANNEL_ID_QUERY,
    FROM_FRIEND_QUERY,
    NOTIFICATION_AND_INSERT_TIME_CONDITION_EXPRESSION,
    NOTIFICATIONS_CHANNEL_INDEX,
    NOTIFICATIONS_FRIENDS_INDEX,
    NOTIFICATIONS_TABLE_NAME,
    NOTIFICATIONS_USER_INDEX,
    USERNAME_QUERY
} from "./Notifications_Constants";

export class NotificationsDAO {
    constructor(private docClient: DocumentClient) {
    }

    public getAllNotificationsForUser(username: string): Promise<Array<NotificationObject>> {
        let params = {
            TableName: NOTIFICATIONS_TABLE_NAME,
            IndexName: NOTIFICATIONS_USER_INDEX,
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

    public getAllFriendRequestsFromUser(fromFriend: string): Promise<Array<NotificationObject>> {
        let params = {
            TableName: NOTIFICATIONS_TABLE_NAME,
            IndexName: NOTIFICATIONS_FRIENDS_INDEX,
            KeyConditionExpression: FROM_FRIEND_QUERY,
            ExpressionAttributeValues: {
                ":fromFriend": fromFriend
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

    public getAllNotificationsForChannel(channelId: string): Promise<Array<NotificationObject>> {
        let params = {
            TableName: NOTIFICATIONS_TABLE_NAME,
            IndexName: NOTIFICATIONS_CHANNEL_INDEX,
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

    public getAllNotificationsForChannelAtUsername(
        channelId: string,
        username: string
    ): Promise<Array<NotificationObject>> {
        let params = {
            TableName: NOTIFICATIONS_TABLE_NAME,
            IndexName: NOTIFICATIONS_CHANNEL_INDEX,
            KeyConditionExpression: CHANNEL_ID_QUERY,
            FilterExpression: USERNAME_QUERY,
            ExpressionAttributeValues: {
                ":channelId": channelId,
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

    public socketCreateNewNotification(notificationSocketObject: NotificationSocketObject): Promise<void> {
        let notificationDBObject: NotificationDBObject = {
            notificationId: notificationSocketObject.notification.notificationId,
            insertedTime: notificationSocketObject.notification.insertedTime,
            username: notificationSocketObject.notification.username,
            channelId: notificationSocketObject.notification.channelId,
            channelName: notificationSocketObject.notification.channelName,
            channelType: notificationSocketObject.notification.channelType,
            type: notificationSocketObject.notification.type,
            fromFriend: notificationSocketObject.notification.fromFriend,
            message: notificationSocketObject.notification.message
        };

        let params = {
            Item: notificationDBObject,
            TableName: NOTIFICATIONS_TABLE_NAME
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

    public createNewNotification(notificationObject: NotificationObject): Promise<void> {
        let notificationDBObject: NotificationDBObject = {
            notificationId: notificationObject.notificationId,
            insertedTime: notificationObject.insertedTime,
            username: notificationObject.username,
            channelId: notificationObject.channelId,
            channelName: notificationObject.channelName,
            channelType: notificationObject.channelType,
            type: notificationObject.type,
            message: notificationObject.message,
            fromFriend: notificationObject.fromFriend
        };

        let params = {
            Item: notificationDBObject,
            TableName: NOTIFICATIONS_TABLE_NAME
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

    public deleteNotification(notificationId: string, insertedTime: number): Promise<void> {
        let params = {
            TableName: NOTIFICATIONS_TABLE_NAME,
            Key: {
                notificationId: notificationId,
                insertedTime: insertedTime
            },
            ConditionExpression: NOTIFICATION_AND_INSERT_TIME_CONDITION_EXPRESSION,
            ExpressionAttributeValues: {
                ":notificationId": notificationId,
                ":i": insertedTime
            }
        };

        return new Promise<void>((resolve, reject) => {
            this.docClient.delete(params, (err: AWSError) => {
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
