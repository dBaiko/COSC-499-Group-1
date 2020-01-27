/* tslint:disable:no-console */
import aws from "aws-sdk";
import {awsConfigPath} from "../../config/aws-config";

aws.config.loadFromPath(awsConfigPath);

const docClient = new aws.DynamoDB.DocumentClient();

const USER_CHANNEL_TABLE_NAME = "UserChannel";
const CHANNELID_USERNAME_INDEX = "channelId-username-index";

class UserChannelDAO {

    private channelIdQueryDeclaration = "channelId = :channelId";
    private usernameQueryDeclaration = "username = :username";

    public getAll(): Promise<any> {
        const params = {
            TableName: USER_CHANNEL_TABLE_NAME,
        };

        return new Promise((resolve, reject) => {
            docClient.scan(params, (err, data) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    console.log("Query Succeeded");
                    resolve(data.Items);
                }
            });
        });

    }

    public addNewUserToChannel(username: string, channelId: string, userChannelRole: string, channelName: string, channelType: string): Promise<any> {
        const params = {
            Item: {
                username,
                channelId,
                userChannelRole,
                channelName,
                channelType
            },
            TableName: USER_CHANNEL_TABLE_NAME
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
            TableName: USER_CHANNEL_TABLE_NAME,
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

    public getAllSubscribedUsers(channelId: number): Promise<any> {
        const params = {
                TableName: USER_CHANNEL_TABLE_NAME,
                IndexName: CHANNELID_USERNAME_INDEX,
                KeyConditionExpression: this.channelIdQueryDeclaration,
                ExpressionAttributeValues: {
                    ":channelId": channelId
                }
            }
        ;

        return new Promise((resolve, reject) => {
            docClient.query(params, (err, data) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    console.log("Query for " + channelId + " Succeeded");
                    resolve(data.Items);
                }
            });

        });
    }

}

export default UserChannelDAO;
