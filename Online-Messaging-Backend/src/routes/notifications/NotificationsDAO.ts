import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { uuid } from "uuidv4";

const NOTIFICATIONS_TABLE_NAME = "Notifications";
const NOTIFICATIONS_USER_INDEX = "username-insertedTime-index";

export interface NotificationObject {
    notificationId: string,
    insertedTime: number,
    username: string,
    channelId: string,
    channelName: string,
    type: string,
    message: string
}

export class NotificationsDAO {
    private usernameQueryDeclaration = "username = :username";

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

        return new Promise<any>(((resolve, reject) => {
            this.docClient.query(params, ((err, data) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    console.log("Query for " + username + "'s notifications succeeded");
                    resolve(data.Items);
                }
            }));
        }));

    }

    public createNewNotification(notification: NotificationObject): Promise<any> {
        if (notification.notificationId == null) {
            notification.notificationId = uuid();
        }
        if (notification.insertedTime == null) {
            notification.insertedTime = Date.now();
        }

        const params = {
            Item: notification,
            TableName: NOTIFICATIONS_TABLE_NAME
        };

        return new Promise<any>(((resolve, reject) => {
            this.docClient.put(params, ((err, data) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    console.log("Added new notification successfully");
                    resolve();
                }
            }));
        }));

    }

    public deleteNotification(notificationId: string, insertedTime: number): Promise<any> {
        console.log(notificationId);
        const params = {
            TableName: NOTIFICATIONS_TABLE_NAME,
            Key: {
                "notificationId": notificationId,
                "insertedTime": insertedTime
            },
            ConditionExpression: "notificationId = :notificationId and insertedTime = :i",
            ExpressionAttributeValues: {
                ":notificationId": notificationId,
                ":i": insertedTime
            }
        };

        return new Promise<any>(((resolve, reject) => {
            this.docClient.delete(params, (err, data) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    console.log("Successfully deleted item");
                    resolve();
                }
            });
        }));

    }

}
