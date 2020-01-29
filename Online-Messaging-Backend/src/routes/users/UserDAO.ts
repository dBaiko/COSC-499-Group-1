/* tslint:disable:no-console */
import aws from "aws-sdk";
import { awsConfigPath } from "../../config/aws-config";

aws.config.loadFromPath(awsConfigPath);

const docClient = new aws.DynamoDB.DocumentClient();

const USERS_TABLE_NAME = "Users";

class UserDAO {
    private usernameQueryDeclaration = "username = :username";

    public createNewUser(username: string, email: string, firstName: string, lastName: string): Promise<any> {
        const params = {
            Item: {
                email,
                firstName,
                lastName,
                username
            },
            TableName: USERS_TABLE_NAME
        };
        return new Promise((resolve, reject) => {
            docClient.put(params, (err, data) => {
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
    public updateProfile(username: string, email: string, firstName: string, lastName: string,
                         age: number, school: string, gender: string, activities: string, bio: string) {
        const params =
            {
                TableName: USERS_TABLE_NAME,
                Key:
                    {
                        username,
                        email,
                    },
                UpdateExpression:
                    "set info.firstName=:f, info.lastName=:l, info.age=:a, info.school=:s, info.gender=:g, " +
                    "info.activities=:v, info.bio=:b",
                ExpressionAttributeValues:
                    {
                        ":f": firstName,
                        ":l": lastName,
                        ":a": age,
                        ":s": school,
                        ":g": gender,
                        ":v": activities,
                        ":b": bio,
                    }
            };

        console.log("Updating profile for user" + username + "...");
        return new Promise((resolve, reject) => {
            docClient.update(params, (err, data) => {
                if (err) {
                    console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
                    reject();
                } else {
                    console.log("Item updated successfully:", JSON.stringify(data, null, 2));
                    resolve();
                }
            });
        });
    }

    public getUserProfile(username: string) {
        const params =
            {
                TableName: USERS_TABLE_NAME,
                KeyConditionExpression: "username = :username",
                ExpressionAttributeValues:
                    {
                        ":username": username
                    }
            };
        return new Promise((resolve, reject) =>
        {
            docClient.query(params, (err, data) =>
            {
                if (err)
                {
                    console.log(err);
                    reject(err);
                }
                else
                {
                    console.log("Successfully retrieved profile for user "+username);
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
            docClient.query(params, (err, data) => {
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
}

export default UserDAO;
