/* tslint:disable:no-console */
import { DocumentClient } from "aws-sdk/clients/dynamodb";

const USERS_TABLE_NAME = "Users";

interface UserObject {
    username: string;
    email: string;
}

class UserDAO {
    private usernameQueryDeclaration = "username = :username";

    constructor(private docClient: DocumentClient) {}

    public createNewUser(username: string, email: string): Promise<any> {
        const params = {
            Item: {
                email,
                username
            },
            TableName: USERS_TABLE_NAME
        };
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

    public updateUser(username: string, email: string) {
        const params = {
            TableName: USERS_TABLE_NAME,
            Key: {
                username: username
            },
            UpdateExpression: "SET email = :e",
            ExpressionAttributeValues: {
                ":e": email
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
            TableName: USERS_TABLE_NAME,
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

    public getUserInfoByUsername(username: string) {
        const params = {
            TableName: USERS_TABLE_NAME,
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

    public getAllUsers(): Promise<any> {
        const params = {
            TableName: USERS_TABLE_NAME
        };

        return new Promise((resolve, reject) => {
            this.docClient.scan(params, (err, data) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    console.log("Query Succeeded");
                    resolve(data.Items.sort((a: UserObject, b: UserObject) => (a.username > b.username ? 1 : -1)));
                }
            });
        });
    }
}

export default UserDAO;
