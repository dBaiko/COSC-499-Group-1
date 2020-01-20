/* tslint:disable:no-console */
import aws from "aws-sdk";
import {awsConfigPath} from "../../config/aws-config";

aws.config.loadFromPath(awsConfigPath);

const docClient = new aws.DynamoDB.DocumentClient();

class ChannelDAO {

    public getChannelInfo(channelId: number): Promise<any> {
        const params = {
            TableName: 'Channel',
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
            TableName: 'Channel',

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

}

export default ChannelDAO;
