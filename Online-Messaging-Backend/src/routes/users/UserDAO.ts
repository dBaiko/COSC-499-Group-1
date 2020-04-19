import { DocumentClient, QueryOutput, ScanOutput } from "aws-sdk/clients/dynamodb";
import { UserObject } from "../../config/app-config";
import { AWSError } from "aws-sdk";
import { USERNAME_QUERY, USERS_TABLE_NAME } from "./Users_Constants";

const EMAIL_UPDATE_EXPRESSION = "SET email = :e";

export class UserDAO {
    constructor(private docClient: DocumentClient) {
    }

    public createNewUser(username: string, email: string): Promise<void> {
        let params = {
            Item: {
                email,
                username
            },
            TableName: USERS_TABLE_NAME
        };
        return new Promise<void>((resolve, reject) => {
            this.docClient.put(params, (err: AWSError) => {
                if (err) {
                    console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 4));
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    public updateUser(username: string, email: string): Promise<void> {
        let params = {
            TableName: USERS_TABLE_NAME,
            Key: {
                username: username
            },
            UpdateExpression: EMAIL_UPDATE_EXPRESSION,
            ExpressionAttributeValues: {
                ":e": email
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

    public getUserInfoByUsername(username: string): Promise<Array<UserObject>> {
        let params = {
            TableName: USERS_TABLE_NAME,
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

    public getAllUsers(): Promise<Array<UserObject>> {
        let params = {
            TableName: USERS_TABLE_NAME
        };

        return new Promise<any>((resolve, reject) => {
            this.docClient.scan(params, (err: AWSError, data: ScanOutput) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    let items = data.Items as any;
                    resolve(items.sort((a: UserObject, b: UserObject) => (a.username > b.username ? 1 : -1)));
                }
            });
        });
    }
}
