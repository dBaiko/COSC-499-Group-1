/* tslint:disable:no-console */
import aws from "aws-sdk";
import { awsConfigPath } from "../../config/aws-config";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

aws.config.loadFromPath(awsConfigPath);
const PROFILES_TABLE_NAME = "Profiles";

class ProfileDAO {
    constructor(private docClient: DocumentClient) {
    }

    public createProfile(username: string, firstName: string, lastName: string): Promise<any> {
        const params = {
            Item: {
                firstName,
                lastName,
                username
            },
            TableName: PROFILES_TABLE_NAME
        };
        console.log("Creating Profile for" + username + "...");
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

    public updateProfile(username: string, firstName: string, lastName: string) {
        const params = {
            TableName: PROFILES_TABLE_NAME,
            Key: {
                username: username
            },
            UpdateExpression: "SET firstName = :f, lastName=:l",
            ExpressionAttributeValues: {
                ":f": firstName,
                ":l": lastName
            }
        };

        console.log("Updating profile for user " + username + "...");
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

    public getUserProfile(username: string) {
        const params = {
            TableName: PROFILES_TABLE_NAME,
            KeyConditionExpression: "username = :username",
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
                    console.log("Successfully retrieved profile for user " + username);
                    resolve(data.Items);
                }
            });
        });
    }
}

export default ProfileDAO;
