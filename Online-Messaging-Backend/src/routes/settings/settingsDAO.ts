import { DocumentClient, QueryOutput } from "aws-sdk/clients/dynamodb";
import { AWSError } from "aws-sdk";
import { UserObject } from "../../config/app-config";

const SETTINGS_TABLE_NAME = "Settings";
const USERNAME_QUERY = "username = :username";
const SETTINGS_UPDATE_EXPRESSION = "SET theme = :t, explicit = :e";

export class SettingsDAO {
    constructor(private docClient: DocumentClient) {
    }

    public createSettingsInfo(username: string, theme: string): Promise<void> {
        let params = {
            Item: {
                username,
                theme
            },
            TableName: SETTINGS_TABLE_NAME
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

    public getSettingsInfoByUsername(username: string): Promise<Array<UserObject>> {
        let params = {
            TableName: SETTINGS_TABLE_NAME,
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

    public updateSettings(username: string, theme: string, explicit: boolean): Promise<void> {
        let params = {
            TableName: SETTINGS_TABLE_NAME,
            Key: {
                username: username
            },
            UpdateExpression: SETTINGS_UPDATE_EXPRESSION,
            ExpressionAttributeValues: {
                ":t": theme,
                ":e": explicit
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
}
