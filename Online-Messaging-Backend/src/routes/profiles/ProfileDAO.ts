/* tslint:disable:no-console */
import aws from "aws-sdk";
import fs from "fs";
import { awsConfigPath } from "../../config/aws-config";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { ManagedUpload } from "aws-sdk/lib/s3/managed_upload";
import UserChannelDAO from "../userChannels/UserChannelDAO";
import SendData = ManagedUpload.SendData;

export interface ProfileObject {
    username: string;
    firstName: string;
    lastName: string;
    phone: string,
    bio: string,
    gender: string,
    dateOfBirth: string,
    citizenship: string,
    grade: number,
    gradYear: number,
    previousCollegiate: boolean,
    street: string,
    unitNumber: string,
    city: string,
    province: string,
    country: string,
    postalCode: string,
    club: string,
    injuryStatus: string,
    instagram: string,
    languages: Array<string>,
    coachFirstName: string,
    coachLastName: string,
    coachPhone: string,
    coachEmail: string,
    parentFirstName: string,
    parentLastName: string,
    parentEmail: string,
    parentPhone: string,
    budget: string
}

aws.config.loadFromPath(awsConfigPath);
const PROFILES_TABLE_NAME = "Profiles";

const PROFILE_IMAGE_S3_PREFIX: string =
    "https://streamline-athletes-messaging-app.s3.ca-central-1.amazonaws.com/user-profile-images/";
const DEFAULT_PROFILE_IMAGE: string = "default.png";

export class ProfileDAO {
    constructor(private docClient: DocumentClient) {
    }

    public createProfile(username: string, firstName: string, lastName: string): Promise<any> {
        let profileImage = PROFILE_IMAGE_S3_PREFIX + DEFAULT_PROFILE_IMAGE;
        let status: string = " ";

        const params = {
            Item: {
                firstName,
                lastName,
                username,
                profileImage,
                status
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

    public updateProfile(profile: ProfileObject) {
        const params = {
            TableName: PROFILES_TABLE_NAME,
            Key: {
                username: profile
            },
            UpdateExpression:
                "SET firstName = :f, lastName=:l, phone = :p, bio = :b, gender = :g, dateOfBirth = :d, citizenship = :c," +
                " grade = :grade, gradYear = :gradYear, previousCollegiate = :prev, street = :s, unitNumber = :u," +
                " city = :city, province = :prov, country = :country, postalCode = :post, club = :club," +
                " injuryStatus = :inj, instagram = :insta, languages = :lang, coachFirstName = :cf, coachLastName = :cl," +
                " coachPhone = :cp, coachEmail = :ce, parentFirstName = :pf, parentLastName = :pl, parentPhone = :pp," +
                " parentEmail = pe, budget = :bud",
            ExpressionAttributeValues: {
                ":f": profile.firstName,
                ":l": profile.lastName,
                ":p": profile.phone,
                ":b": profile.bio,
                ":g": profile.gender,
                ":d": profile.dateOfBirth,
                ":c": profile.citizenship,
                ":grade": profile.grade,
                ":gradYear": profile.gradYear,
                ":prev": profile.previousCollegiate,
                ":s": profile.street,
                ":u": profile.unitNumber,
                ":city": profile.city,
                ":province": profile.province,
                ":country": profile.country,
                ":post": profile.postalCode,
                ":club": profile.club,
                ":inj": profile.injuryStatus,
                ":insta": profile.instagram,
                ":lang": profile.languages.toString(),
                ":cf": profile.coachFirstName,
                ":cl": profile.coachLastName,
                ":cp": profile.coachPhone,
                ":ce": profile.coachEmail,
                ":pf": profile.parentFirstName,
                ":pl": profile.parentLastName,
                ":pp": profile.parentPhone,
                ":pe": profile.parentEmail,
                ":bud": profile.budget
            }
        };

        console.log("Updating profile for user " + profile.username + "...");
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

    public updateStatus(username: string, status: string): Promise<any> {
        if (status == "") {
            status = " ";
        }
        return new Promise<any>((resolve, reject) => {
            const params = {
                TableName: PROFILES_TABLE_NAME,
                Key: {
                    username: username
                },
                UpdateExpression: "SET statusText = :s",
                ExpressionAttributeValues: {
                    ":s": status
                }
            };

            this.docClient.update(params, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    let userChannelDAO: UserChannelDAO = new UserChannelDAO(this.docClient);
                    userChannelDAO
                        .updateStatus(username, status)
                        .then(() => {
                            resolve();
                        })
                        .catch((err) => {
                            reject();
                        });
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

                            userChannelDAO
                                .updateProfilePicture(username)
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
