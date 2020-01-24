/* tslint:disable:no-console */
import aws from "aws-sdk";
import {awsConfigPath} from "../../config/aws-config";

aws.config.loadFromPath(awsConfigPath);

const docClient = new aws.DynamoDB.DocumentClient();

const userChannelTableName = "UserChannel";

class UserChannelDAO {

    public addNewUserToChannel(username: string, channelId: string, userChannelRole: string): Promise<any> {
        const params = {
            Item: {
                username,
                channelId,
                userChannelRole
            },
            TableName: userChannelTableName
        }

        return new Promise((resolve, reject) => {
            docClient.put(params, (err, data) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    console.log("Added new user subsription: ", JSON.stringify(data, null, 2));
                    resolve();
                }
            })
        })

    }

    public getAllSubscribedChannels(username: string): Promise<any> {
        const params = {
            TableName: userChannelTableName,
            KeyConditionExpression: "username = :username",
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

        })
    }

}

export default UserChannelDAO;
