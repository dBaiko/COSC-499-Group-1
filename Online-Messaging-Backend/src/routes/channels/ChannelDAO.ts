/* tslint:disable:no-console */
import aws from "aws-sdk";
import {awsConfigPath} from "../../config/aws-config";

aws.config.loadFromPath(awsConfigPath);

const docClient = new aws.DynamoDB.DocumentClient();

const channelTableName = "Channel";
const userChannelTableName = "UserChannel";

interface ChannelObject {
    channelId: number,
    channelName: string,
    channelType: string
}

class ChannelDAO {

    public getChannelInfo(channelId: number): Promise<any> {
        const params = {
            TableName: channelTableName,
            KeyConditionExpression: "channelId = :channelId",
            ExpressionAttributeValues: {
                ":channelId": channelId
            }
        };

        return new Promise((resolve, reject) => {
            docClient.query(params, (err, data) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    console.log("Query for " + channelId + " Succeeded");
                    resolve(data.Items)
                    ;
                }
            });

        });

    }

    public getAllChannels(): Promise<any> {
        const params = {
            TableName: channelTableName,
        };

        return new Promise((resolve, reject) => {
            docClient.scan(params, (err, data) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    console.log("Query Succeeded");
                    resolve(data.Items.sort((a: ChannelObject, b: ChannelObject) => (a.channelName > b.channelName) ? 1 : -1));
                }
            });
        });

    }

    public addNewChannel(channelName: string, channelType: string, firstUsername: string, firstUserChannelRole: string): Promise<any> {
        const channelId = Date.now();
        const params = {
            Item: {
                channelId,
                channelName,
                channelType
            },
            TableName: channelTableName
        };

        return new Promise((resolve, reject) => {
            docClient.put(params, (err, data) => {
                if (err) {
                    console.error("Unable to add new channel. Error JSON: ", JSON.stringify(err, null, 2));
                    reject(err);
                } else {
                    console.log("Added new:", JSON.stringify(data, null, 2));
                    this.addFirstUserToChannel(channelId, firstUsername, firstUserChannelRole)
                        .then(() => {
                            resolve();
                        })
                        .catch((err) => {
                            reject(err);
                        });

                }
            });
        })

    }

    private addFirstUserToChannel(channelId: number, username: string, userChannelRole: string): Promise<any> {
        const params = {
            Item: {
                username,
                channelId,
                userChannelRole
            },
            TableName: userChannelTableName
        };

        return new Promise((resolve, reject) => {
            docClient.put(params, (err, data) => {
                if (err) {
                    console.error("Unable to add a new item to UserChannel Table. Error JSON: ", JSON.stringify(err, null, 2));
                    reject(err);
                } else {
                    console.log("Added new:", JSON.stringify(data, null, 2));
                    resolve();
                }
            })
        })

    }


}

export default ChannelDAO;
