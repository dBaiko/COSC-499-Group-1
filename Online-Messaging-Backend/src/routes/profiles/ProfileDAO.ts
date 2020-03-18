/* tslint:disable:no-console */
import aws from "aws-sdk";
import fs from "fs";
import { awsConfigPath } from "../../config/aws-config";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { ManagedUpload } from "aws-sdk/lib/s3/managed_upload";
import UserChannelDAO from "../userChannels/UserChannelDAO";
import SendData = ManagedUpload.SendData;

aws.config.loadFromPath(awsConfigPath);
const PROFILES_TABLE_NAME = "Profiles";

const PROFILE_IMAGE_S3_PREFIX: string =
    "https://streamline-athletes-messaging-app.s3.ca-central-1.amazonaws.com/user-profile-images/";
const DEFAULT_PROFILE_IMAGE: string = "default.png";

class ProfileDAO {
    constructor(private docClient: DocumentClient) {
    }

    public createProfile(username: string, firstName: string, lastName: string): Promise<any> {
        let profileImage = PROFILE_IMAGE_S3_PREFIX + DEFAULT_PROFILE_IMAGE;

        const params = {
            Item: {
                firstName,
                lastName,
                username,
                profileImage
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

    public updateProfileImage(file: Express.Multer.File, username: string): Promise<any> {
        let path = "./src/routes/profiles/temp/" + file.filename;

        let s3 = new aws.S3({ endpoint: "s3.ca-central-1.amazonaws.com" });

        let profileImageFilename = username + ".png";

        let param = {
            Bucket: "streamline-athletes-messaging-app",
            Body: fs.createReadStream(path),
            Key: "user-profile-images/" + profileImageFilename
        };

        return new Promise<any>((resolve, reject) => {
            s3.upload(param, (err: Error, data: SendData) => {
                if (err) {
                    console.log(err);
                    fs.unlink(path, () => {
                        console.log(err);
                    });
                    reject(err);
                } else {
                    fs.unlink(path, () => {
                        console.log(err);
                    });

                    const params = {
                        TableName: PROFILES_TABLE_NAME,
                        Key: {
                            username: username
                        },
                        UpdateExpression: "SET profileImage = :p",
                        ExpressionAttributeValues: {
                            ":p": PROFILE_IMAGE_S3_PREFIX + profileImageFilename
                        }
                    };

                    this.docClient.update(params, (err, data) => {
                        if (err) {
                            console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 4));
                            reject();
                        } else {
                            console.log("Item updated successfully:", JSON.stringify(data, null, 4));

                            let userChannelDAO: UserChannelDAO = new UserChannelDAO(this.docClient);

                            userChannelDAO.updateProfilePicture(username)
                                .then(() => {
                                })
                                .catch((err) => {
                                    console.log(err);
                                    reject(err);
                                });
                            resolve(profileImageFilename);
                        }
                    });
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
