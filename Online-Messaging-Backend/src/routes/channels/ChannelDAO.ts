/* tslint:disable:no-console */
import aws from "aws-sdk";
import { awsConfigPath } from "../../config/aws-config";
import UserChannelDAO from "../userChannels/UserChannelDAO";
import { uuid } from "uuidv4";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

aws.config.loadFromPath(awsConfigPath);

const channelTableName: string = "Channel";

interface ChannelObject {
    channelId: string;
    channelName: string;
    channelType: string;
}

class ChannelDAO {
    private channelIdQueryDeclaration = "channelId = :channelId";

    constructor(private docClient: DocumentClient) {}

    public getChannelInfo(channelId: string): Promise<any> {
        const params = {
            TableName: channelTableName,
            KeyConditionExpression: this.channelIdQueryDeclaration,
            ExpressionAttributeValues: {
                ":channelId": channelId
            }
        };

        return new Promise((resolve, reject) => {
            this.docClient.query(params, (err, data) => {
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
            TableName: channelTableName
        };

        return new Promise((resolve, reject) => {
            this.docClient.scan(params, (err, data) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    console.log("Query Succeeded");
                    resolve(
                        data.Items.sort((a: ChannelObject, b: ChannelObject) =>
                            a.channelName > b.channelName ? 1 : -1
                        )
                    );
                }
            });
        });
    }

    public addNewChannel(
        channelName: string,
        channelType: string,
        firstUsername: string,
        firstUserChannelRole: string
    ): Promise<any> {
        const userChannelDAO = new UserChannelDAO(this.docClient);
        const channelId = uuid();
        const params = {
            Item: {
                channelId,
                channelName,
                channelType
            },
            TableName: channelTableName
        };
        return new Promise((resolve, reject) => {
            this.docClient.put(params, (err, data) => {
                if (err) {
                    console.error("Unable to add new channel. Error JSON: ", JSON.stringify(err, null, 2));
                    reject(err);
                } else {
                    console.log("Added new:", JSON.stringify(data, null, 2));
                    userChannelDAO
                        .addNewUserToChannel(firstUsername, channelId, firstUserChannelRole, channelName, channelType)
                        .then(() => {
                            resolve(params.Item);
                        })
                        .catch((err) => {
                            reject(err);
                        });
                }
            });
        });
    }
}

export default ChannelDAO;
