/* tslint:disable:no-console */
import aws from "aws-sdk";
import {awsConfigPath} from "../../config/aws-config";

aws.config.loadFromPath(awsConfigPath);

const docClient = new aws.DynamoDB.DocumentClient();

const tableName = "Channel";

class ChannelDAO {

    public getChannelInfo(channelId: number): Promise<any> {
        const params = {
            TableName: tableName,
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
                    resolve(data.Items);
                }
            });

        });

    }

    public getAllChannels(): Promise<any> {
        const params = {
            TableName: tableName,

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

    public addNewChannel(channelName: string, channelType: string): Promise<any> {
        const channelId = Date.now();
        const params = {
            Item: {
                channelId,
                channelName,
                channelType
            },
            TableName: tableName
        };

        return new Promise((resolve, reject) => {
            docClient.put(params, (err, data) => {
                if (err) {
                    console.error("Unable to add new channel. Error JSON: ", JSON.stringify(err, null, 2));
                    reject(err);
                } else {
                    console.log("Added new:", JSON.stringify(data, null, 2));
                    resolve();
                }
            });
        })

    }


}

export default ChannelDAO;
