/* tslint:disable:no-console */
import { DocumentClient } from "aws-sdk/clients/dynamodb";

const SETTINGS_TABLE_NAME = "Settings";

interface SettingsObject {
    username: string;
    theme: string;
}

class SettingsDAO {
    private usernameQueryDeclaration = "username = :username";

    constructor(private docClient: DocumentClient) {
    }

    public createSettingsInfo(username: string, theme: string): Promise<any> {
        const params = {
            Item: {
                username,
                theme
            },
            TableName: SETTINGS_TABLE_NAME
        };
        console.log("Creating SETTINGS for" + username + "...");
        return new Promise((resolve, reject) => {
            this.docClient.put(params, (err, data) => {
                if (err) {
                    console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
                    reject(err);
                } else {
                    console.log("Added item:", JSON.stringify(data, null, 2));
                    resolve();
                }
            });
        });
    }

    public getSettingsInfoByUsername(username: string) {
        const params = {
            TableName: SETTINGS_TABLE_NAME,
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

    public updateSettings(username: string, theme: string) {
        const params = {
            TableName: SETTINGS_TABLE_NAME,
            Key: {
                username: username
            },
            UpdateExpression: "SET theme = :t",
            ExpressionAttributeValues: {
                ":t": theme
            }
        };

        console.log("Updating settings for user " + username + "...");
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
}

export default SettingsDAO;
