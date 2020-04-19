import aws, { AWSError } from "aws-sdk";
import fs from "fs";
import { awsConfigPath, AWSS3Config } from "../../config/aws-config";
import { DocumentClient, QueryOutput } from "aws-sdk/clients/dynamodb";
import { UserChannelDAO } from "../userChannels/UserChannelDAO";
import { sanitizeInput } from "../../index";
import { Constants, ProfileObject } from "../../config/app-config";
import {
    DEFAULT_PROFILE_IMAGE,
    PROFILE_IMAGE_S3_PREFIX,
    PROFILE_IMAGE_UPDATE_EXPRESSION,
    PROFILE_UPDATE_EXPRESSION,
    PROFILES_TABLE_NAME,
    STATUS_UPDATE_EXPRESSION,
    TEMP_RETRIEVAL_DIRECTORY,
    TWO_THOUSAND,
    USERNAME_UPDATE_EXPRESSION
} from "./Profile_Constansts";

aws.config.loadFromPath(awsConfigPath);

export class ProfileDAO {
    constructor(private docClient: DocumentClient) {
    }

    public createProfile(username: string, firstName: string, lastName: string): Promise<any> {
        let profileImage = PROFILE_IMAGE_S3_PREFIX + DEFAULT_PROFILE_IMAGE;
        let status: string = Constants.SPACE;

        let params = {
            Item: {
                firstName,
                lastName,
                username,
                profileImage,
                status
            },
            TableName: PROFILES_TABLE_NAME
        };
        return new Promise((resolve, reject) => {
            this.docClient.put(params, (err: AWSError) => {
                if (err) {
                    console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    // noinspection DuplicatedCode
    public updateProfile(profile: ProfileObject) {
        if (!profile.languages || profile.languages.length == 0) {
            profile.languages = [Constants.EMPTY];
        }
        if (!profile.phone) {
            profile.phone = Constants.EMPTY;
        }
        if (!profile.bio) {
            profile.bio = Constants.EMPTY;
        }
        if (!profile.gender) {
            profile.gender = Constants.EMPTY;
        }
        if (!profile.dateOfBirth) {
            profile.dateOfBirth = Constants.EMPTY;
        }
        if (!profile.citizenship) {
            profile.citizenship = Constants.EMPTY;
        }
        if (!profile.grade) {
            profile.grade = 0;
        }
        if (!profile.gradYear) {
            profile.gradYear = TWO_THOUSAND;
        }
        if (!profile.previousCollegiate) {
            profile.previousCollegiate = Constants.EMPTY;
        }
        if (!profile.street) {
            profile.street = Constants.EMPTY;
        }
        if (!profile.unitNumber) {
            profile.unitNumber = Constants.EMPTY;
        }
        if (!profile.city) {
            profile.city = Constants.EMPTY;
        }
        if (!profile.province) {
            profile.province = Constants.EMPTY;
        }
        if (!profile.country) {
            profile.country = Constants.EMPTY;
        }
        if (!profile.postalCode) {
            profile.postalCode = Constants.EMPTY;
        }
        if (!profile.club) {
            profile.club = Constants.EMPTY;
        }
        if (!profile.injuryStatus) {
            profile.injuryStatus = Constants.EMPTY;
        }
        if (!profile.instagram) {
            profile.instagram = Constants.EMPTY;
        }
        if (!profile.coachFirstName) {
            profile.coachFirstName = Constants.EMPTY;
        }
        if (!profile.coachLastName) {
            profile.coachLastName = Constants.EMPTY;
        }
        if (!profile.coachPhone) {
            profile.coachPhone = Constants.EMPTY;
        }
        if (!profile.coachEmail) {
            profile.coachEmail = Constants.EMPTY;
        }
        if (!profile.parentFirstName) {
            profile.parentFirstName = Constants.EMPTY;
        }
        if (!profile.parentLastName) {
            profile.parentLastName = Constants.EMPTY;
        }
        if (!profile.parentPhone) {
            profile.parentPhone = Constants.EMPTY;
        }
        if (!profile.parentEmail) {
            profile.parentEmail = Constants.EMPTY;
        }
        if (!profile.budget) {
            profile.budget = Constants.EMPTY;
        }

        profile.firstName = sanitizeInput(profile.firstName);
        profile.lastName = sanitizeInput(profile.lastName);
        profile.phone = sanitizeInput(profile.phone);
        profile.bio = sanitizeInput(profile.bio);
        profile.gender = sanitizeInput(profile.gender);
        profile.dateOfBirth = sanitizeInput(profile.dateOfBirth);
        profile.citizenship = sanitizeInput(profile.citizenship);
        profile.street = sanitizeInput(profile.street);
        profile.unitNumber = sanitizeInput(profile.unitNumber);
        profile.city = sanitizeInput(profile.city);
        profile.province = sanitizeInput(profile.province);
        profile.country = sanitizeInput(profile.country);
        profile.postalCode = sanitizeInput(profile.postalCode);
        profile.club = sanitizeInput(profile.club);
        profile.injuryStatus = sanitizeInput(profile.injuryStatus);
        profile.instagram = sanitizeInput(profile.instagram);
        profile.coachFirstName = sanitizeInput(profile.coachFirstName);
        profile.coachLastName = sanitizeInput(profile.coachLastName);
        profile.coachPhone = sanitizeInput(profile.coachPhone);
        profile.coachEmail = sanitizeInput(profile.coachEmail);
        profile.parentFirstName = sanitizeInput(profile.parentFirstName);
        profile.parentLastName = sanitizeInput(profile.parentLastName);
        profile.parentPhone = sanitizeInput(profile.parentPhone);
        profile.parentEmail = sanitizeInput(profile.parentEmail);
        profile.budget = sanitizeInput(profile.budget);

        let params = {
            TableName: PROFILES_TABLE_NAME,
            Key: {
                username: profile.username
            },
            UpdateExpression: PROFILE_UPDATE_EXPRESSION,
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
                ":prov": profile.province,
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

        return new Promise((resolve, reject) => {
            this.docClient.update(params, (err: AWSError) => {
                if (err) {
                    console.error("Unable to update item. Error: " + err);
                    reject();
                } else {
                    resolve();
                }
            });
        });
    }

    public updateStatus(username: string, status: string): Promise<void> {
        if (status == Constants.EMPTY) {
            status = Constants.SPACE;
        }
        return new Promise<void>((resolve, reject) => {
            let params = {
                TableName: PROFILES_TABLE_NAME,
                Key: {
                    username: username
                },
                UpdateExpression: STATUS_UPDATE_EXPRESSION,
                ExpressionAttributeValues: {
                    ":s": status
                }
            };

            this.docClient.update(params, (err: AWSError) => {
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
                            console.error(err);
                            reject();
                        });
                }
            });
        });
    }

    public updateProfileImage(file: Express.Multer.File, username: string): Promise<string> {
        let path = TEMP_RETRIEVAL_DIRECTORY + file.filename;

        let s3 = new aws.S3({ endpoint: AWSS3Config.endpoint });

        let profileImageFilename = username + Constants.PNG_FILE_FORMAT;

        let param = {
            Bucket: AWSS3Config.endpoint,
            Body: fs.createReadStream(path),
            Key: AWSS3Config.imagesFolder + profileImageFilename
        };

        return new Promise<string>((resolve, reject) => {
            s3.upload(param, (err: Error) => {
                if (err) {
                    console.error(err);
                    fs.unlink(path, () => {
                        console.error(err);
                    });
                    reject(err);
                } else {
                    fs.unlink(path, () => {
                        console.error(err);
                    });

                    let params = {
                        TableName: PROFILES_TABLE_NAME,
                        Key: {
                            username: username
                        },
                        UpdateExpression: PROFILE_IMAGE_UPDATE_EXPRESSION,
                        ExpressionAttributeValues: {
                            ":p": PROFILE_IMAGE_S3_PREFIX + profileImageFilename
                        }
                    };

                    this.docClient.update(params, (err: AWSError) => {
                        if (err) {
                            console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 4));
                            reject();
                        } else {
                            let userChannelDAO: UserChannelDAO = new UserChannelDAO(this.docClient);

                            userChannelDAO
                                .updateProfilePicture(username)
                                .then(() => {
                                })
                                .catch((err) => {
                                    console.error(err);
                                    reject(err);
                                });
                            resolve(PROFILE_IMAGE_S3_PREFIX + profileImageFilename);
                        }
                    });
                }
            });
        });
    }

    public getUserProfile(username: string): Promise<Array<ProfileObject>> {
        let params = {
            TableName: PROFILES_TABLE_NAME,
            KeyConditionExpression: USERNAME_UPDATE_EXPRESSION,
            ExpressionAttributeValues: {
                ":username": username
            }
        };
        return new Promise<any>((resolve, reject) => {
            this.docClient.query(params, (err: AWSError, data: QueryOutput) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve(data.Items);
                }
            });
        });
    }
}
