import UserDAO from "../routes/users/UserDAO";
import ChannelDAO from "../routes/channels/ChannelDAO";
import UserChannelDAO from "../routes/userChannels/UserChannelDAO";
import { MessageDAO } from "../routes/messages/MessageDAO";
import SettingsDAO, { SettingsObject } from "../routes/settings/settingsDAO";
import { ProfileDAO, ProfileObject } from "../routes/profiles/ProfileDAO";
import { GetItemOutput, QueryOutput, ScanOutput } from "aws-sdk/clients/dynamodb";
import { NotificationObject, NotificationsDAO } from "../routes/notifications/NotificationsDAO";

interface ChannelObject {
    channelId: string;
    channelName: string;
    channelType: string;
}

interface Message {
    channelId: string;
    username: string;
    content: string;
    messageId?: string;
    insertTime?: number;
    profileImage: string;
    deleted: string;
    channelType?: string;
}

jest.setTimeout(30000);

const { DocumentClient } = require("aws-sdk/clients/dynamodb");

const isTest = process.env.JEST_WORKER_ID;
const config = {
    convertEmptyValues: true,
    ...(isTest && {
        endpoint: "localhost:8000",
        sslEnabled: false,
        region: "local-env"
    })
};

const ddb = new DocumentClient(config);


const PROFILE_IMAGE_S3_PREFIX: string =
    "https://streamline-athletes-messaging-app.s3.ca-central-1.amazonaws.com/user-profile-images/";
const DEFAULT_PROFILE_IMAGE: string = "default.png";

describe("ALL_TESTS", () => {

    describe("UserDAO", () => {

        interface UserObject {
            username: string;
            email: string;
        }

        const user = new UserDAO(ddb);

        beforeEach(() => {
            return new Promise(((resolve) => {
                ddb.put({
                    TableName: "Users",
                    Item: {
                        username: "testUser",
                        email: "testUser@nothing.com",
                        firstName: "Lorem",
                        lastName: "Ipsum"
                    }
                }).promise().then(() => {
                    resolve();
                });
            }));
        });
        afterEach(() => {
            return new Promise((resolve => {
                ddb.delete({
                    TableName: "Users",
                    Key: {
                        username: "testUser"
                    }
                }).promise().then(() => {
                    resolve();
                });
            }));
        });

        it("should create a new user in the table", async () => {
            await user.createNewUser("testUser2", "testUser2@nothing.com");
            const item = await ddb.get({ TableName: "Users", Key: { username: "testUser2" } }).promise();
            expect(item.Item).toEqual({
                username: "testUser2",
                email: "testUser2@nothing.com"
            });
            ddb.delete({
                TableName: "Users",
                Key: {
                    username: "testUser2"
                }
            });
        });

        it("should get user information by username", async () => {
            const item = await user.getUserInfoByUsername("testUser");
            expect(item).toEqual([
                {
                    email: "testUser@nothing.com",
                    firstName: "Lorem",
                    lastName: "Ipsum",
                    username: "testUser"
                }
            ]);
        });

        it("should update a user's email address by username", async () => {
            await user.updateUser("testUser", "testUpdate@nothing.com");
            //const item = await user.getUserInfoByUsername("testUser");
            const item = await ddb.get({ TableName: "Users", Key: { username: "testUser" } }).promise();
            expect(item.Item).toEqual(
                {
                    username: "testUser",
                    firstName: "Lorem",
                    lastName: "Ipsum",
                    email: "testUpdate@nothing.com"
                }
            );
        });

        it("should return a list of all users", async () => {
            ddb.put({
                TableName: "Users",
                Item: {
                    username: "testUser2",
                    email: "test2@nothing.com"
                }
            });
            ddb.put({
                TableName: "Users",
                Item: {
                    username: "testUser3",
                    email: "test3@nothing.com"
                }
            });
            const item = await user.getAllUsers();
            expect(item).toEqual([
                ddb.scan({ TableName: "Users" }).Items.sort(
                    (a: UserObject, b: UserObject) => (a.username > b.username ? 1 : -1)).promise()
            ]);
            ddb.delete({
                TableName: "Users",
                Item: {
                    username: "testUser2",
                    email: "test2@nothing.com"
                }
            });
            ddb.delete({
                TableName: "Users",
                Item: {
                    username: "testUser3",
                    email: "test3@nothing.com"
                }
            });
        });
    });

    describe("ChannelDAO", () => {

        const channel = new ChannelDAO(ddb);

        beforeEach(() => {
            return new Promise(((resolve) => {
                ddb.put({
                    TableName: "Channel",
                    Item: {
                        channelName: "testUser",
                        channelID: "ID01",
                        channelType: "testUser@nothing.com",
                        channelDescription: "Lorem Ipsum",
                        firstUsername: "testUser",
                        firstUserChannelRole: "admin",
                        inviteStatus: "true",
                        profileImage: PROFILE_IMAGE_S3_PREFIX + DEFAULT_PROFILE_IMAGE
                    }
                }).promise().then(() => {
                    resolve();
                });
            }));
        });
        afterEach(() => {
            return new Promise(((resolve) => {
                ddb.delete({
                    TableName: "Channels",
                    Key: {
                        channelID: "ID01",
                        channelName: "testUser"
                    }
                }).promise().then(() => {
                    resolve();
                });
            }));
        });

        it("should create a new channel", async () => {
            await channel.addNewChannel("testChannel",
                "public",
                "testDescript",
                "testUser",
                "admin",
                null,
                PROFILE_IMAGE_S3_PREFIX + DEFAULT_PROFILE_IMAGE);
            const item = await ddb.scan({ TableName: "Channel" }).promise();
            delete item.Items[0].channelId;
            expect(item).toEqual({
                Count: 1,
                Items:
                    {
                        channelName: "testChannel",
                        channelType: "public",
                        inviteStatus: null
                    },
                ScannedCount: 1
            });
        });

        it("should retrieve certain information about a channel", async () => {
            const testChannelScan = await ddb.scan({ TableName: "Channel" }).promise();
            let channelId = testChannelScan.Items[0].channelId;
            const call: ChannelObject = await channel.getChannelInfo(channelId);
            const item = await ddb
                .get({ TableName: "Channel", Key: { channelId: channelId, channelName: "testChannel" } })
                .promise();
            let expectedItem = item.Item;
            expect(expectedItem).toEqual(call);
        });

        it("should return a list of all channels", async () => {
            const list = await channel.getAllChannels();
            const item = await ddb.scan({ TableName: "Channel" }).promise();
            expect(list).toEqual(
                item.Items.sort((a: ChannelObject, b: ChannelObject) => (a.channelName > b.channelName ? 1 : -1))
            );
        });
    });

    describe("UserChannelDAO", () => {

        const userChannel = new UserChannelDAO(ddb);

        beforeEach(() => {
            return new Promise(((resolve) => {
                ddb.put({
                    TableName: "UserChannel",
                    Item: {
                        username: "testUser",
                        channelId: "ID01",
                        userChannelRole: "admin",
                        channelName: "channel",
                        channelType: "public",
                        profileImage: PROFILE_IMAGE_S3_PREFIX + DEFAULT_PROFILE_IMAGE
                    }
                });
                ddb.put({
                    TableName: "UserChannel",
                    Item: {
                        username: "testUser",
                        channelId: "ID02",
                        userChannelRole: "user",
                        channelName: "channel2",
                        channelType: "public",
                        profileImage: PROFILE_IMAGE_S3_PREFIX + DEFAULT_PROFILE_IMAGE
                    }
                });
                ddb.put({
                    TableName: "UserChannel",
                    Item: {
                        username: "testUser2",
                        channelId: "ID01",
                        userChannelRole: "user",
                        channelName: "channel2",
                        channelType: "public",
                        profileImage: PROFILE_IMAGE_S3_PREFIX + DEFAULT_PROFILE_IMAGE
                    }
                }).promise().then(() => {
                    resolve();
                });
            }));
        });

        afterEach(() => {
            return new Promise(((resolve) => {
                ddb.delete({
                    TableName: "UserChannel",
                    Key: {
                        username: "testUser",
                        channelId: "ID01"
                    }
                });
                ddb.delete({
                    TableName: "UserChannel",
                    Key: {
                        username: "testUser",
                        channelId: "ID02"
                    }
                });
                ddb.delete({
                    TableName: "UserChannel",
                    Key: {
                        username: "testUser2",
                        channelId: "ID01"
                    }
                }).promise().then(() => {
                    resolve();
                });
            }));
        })
        ;

        it("should return all users and all channels they are subscribed to", async () => {
            const item = await ddb.scan({ TableName: "UserChannel" }).promise();
            const actual = userChannel.getAll();
            expect(actual).toEqual(item.Items);
        });

        it("should subscribe a user to a channel", async () => {
            const item = await userChannel.addNewUserToChannel(
                "addTest",
                "ID01",
                "user",
                "channel",
                "public",
                PROFILE_IMAGE_S3_PREFIX + DEFAULT_PROFILE_IMAGE);
            const get = ddb.get({ TableName: "UserChannel", Key: { username: "addTest", channelId: "ID01" } });
            expect(item).toEqual(get.Items);
            ddb.delete({ TableName: "UserChannel", Key: { username: "addTest", channelId: "ID01" } });
        });

        it("should return a list of channels a user is subscribed to", async () => {
            const item = await userChannel.getAllSubscribedChannels("testUser");
            const expected = await ddb.get({ TableName: "UserChannel", Key: { username: "testUser" } }).promise();
            expect(item).toEqual(expected.Item);
        });


        it("should return a list of all users subscribed to a channel", async () => {
            const item = await userChannel.getAllSubscribedUsers("ID01");
            const expected = await ddb.get({ TableName: "UserChannel", Key: { channelId: "ID01" } }).promise();
            expect(item).toEqual(expected.Item);
        });

        it("should delete a subscription between a specified user and channel", async () => {
            await userChannel.deleteChannelSubscription("testUser", "ID02");
            const item = ddb.scan({ tableName: "UserChannel" });
            expect(item.scannedCount).toEqual(2);
        });

        it("should update the user's displayed profile picture across all subscribed channels", async () => {
            await userChannel.updateProfilePicture("testUser");
            const sub1 = (await ddb.get({
                TableName: "UserChannel",
                Key: { username: "testUser", channelId: "ID01" }
            }).promise()).Item;
            const sub2 = (await ddb.get({
                TableName: "UserChannel",
                Key: { username: "testUser", channelId: "ID02" }
            }).promise()).Item;
            expect(sub1).toEqual({
                username: "testUser",
                channelId: "ID01",
                userChannelRole: "admin",
                channelName: "channel",
                channelType: "public",
                profileImage: PROFILE_IMAGE_S3_PREFIX + "testUser.png"
            });
            expect(sub2).toEqual({
                username: "testUser",
                channelId: "ID02",
                userChannelRole: "user",
                channelName: "channel2",
                channelType: "public",
                profileImage: PROFILE_IMAGE_S3_PREFIX + "testUser.png"
            });
        });

        it("should update a user's displayed status across all subscribed channels", async () => {
            await userChannel.updateStatus("testUser", "Lorem Ipsum");
            const sub1 = (await ddb.get({
                TableName: "UserChannel",
                Key: { username: "testUser", channelId: "ID01" }
            }).promise()).Item[0];
            const sub2 = (await ddb.get({
                TableName: "UserChannel",
                Key: { username: "testUser", channelId: "ID02" }
            }).promise()).Item[0];
            expect(sub1).toEqual("Lorem Ipsum");
            expect(sub2).toEqual("Lorem Ipsum");
        });
    })
    ;

    describe("MessageDAO", () => {

        const msg = new MessageDAO(ddb);
        const testMessage1: Message = {
            channelId: "channel",
            username: "testUser",
            content: "content1",
            messageId: "ID1",
            insertTime: 1,
            profileImage: PROFILE_IMAGE_S3_PREFIX + DEFAULT_PROFILE_IMAGE,
            deleted: "no",
            channelType: "Public"
        };
        const testMessage2: Message = {
            channelId: "channel",
            username: "testUser",
            content: "content2",
            messageId: "ID2",
            insertTime: 2,
            profileImage: PROFILE_IMAGE_S3_PREFIX + DEFAULT_PROFILE_IMAGE,
            deleted: "no",
            channelType: "Public"
        };
        const testMessageUpdate: Message = {
            channelId: "channel",
            username: "testUser",
            content: "content3",
            messageId: "ID1",
            insertTime: 1,
            profileImage: PROFILE_IMAGE_S3_PREFIX + DEFAULT_PROFILE_IMAGE,
            deleted: "no",
            channelType: "Public"
        };
        const testMessageChannel2: Message = {
            channelId: "channel2",
            username: "testUser",
            content: "content4",
            messageId: "ID3",
            insertTime: 3,
            profileImage: PROFILE_IMAGE_S3_PREFIX + DEFAULT_PROFILE_IMAGE,
            deleted: "no",
            channelType: "Public"
        };
        const testMessage3: Message = {
            channelId: "channel",
            username: "testUser",
            content: "content5",
            messageId: "ID5",
            insertTime: 5,
            profileImage: PROFILE_IMAGE_S3_PREFIX + DEFAULT_PROFILE_IMAGE,
            deleted: "no",
            channelType: "Public"
        };

        beforeEach(() => {
            return new Promise(((resolve) => {
                ddb.put({
                    TableName: "Messages", Item: {
                        channelId: "channel",
                        username: "testUser",
                        content: "content1",
                        messageId: "ID1",
                        insertTime: 1,
                        profileImage: PROFILE_IMAGE_S3_PREFIX + DEFAULT_PROFILE_IMAGE,
                        deleted: "no",
                        channelType: "Public"
                    }
                });
                ddb.put({
                    TableName: "Messages", Item: {
                        channelId: "channel",
                        username: "testUser",
                        content: "content2",
                        messageId: "ID2",
                        insertTime: 2,
                        profileImage: PROFILE_IMAGE_S3_PREFIX + DEFAULT_PROFILE_IMAGE,
                        deleted: "no",
                        channelType: "Public"
                    }
                });
                ddb.put({
                    TableName: "Messages", Item: {
                        channelId: "channel2",
                        username: "testUser",
                        content: "content4",
                        messageId: "ID3",
                        insertTime: 3,
                        profileImage: PROFILE_IMAGE_S3_PREFIX + DEFAULT_PROFILE_IMAGE,
                        deleted: "no",
                        channelType: "Public"
                    }
                }).promise().then(() => {
                    resolve();
                });
            }));
        });
        afterEach(() => {
            return new Promise(((resolve) => {
                ddb.delete({
                    TableName: "Messages", Key: {
                        channelId: "channel1",
                        insertTime: 1
                    }
                });
                ddb.delete({
                    TableName: "Messages", Key: {
                        channelId: "channel1",
                        insertTime: 2
                    }
                });
                ddb.delete({
                    TableName: "Messages", Key: {
                        channelId: "channel2",
                        insertTime: 3
                    }
                }).promise().then(() => {
                    resolve();
                });
            }));
        });

        it("should retrieve the message history for a given channel", async () => {
            const item = await msg.getMessageHistory("channel");
            expect(item.Items[0]).toEqual(testMessage1);
            expect(item.Items[1]).toEqual(testMessage2);
        });

        it("should get all messages from all channels", async () => {
            const item = await msg.getAllMessageHistory();
            const expected = await ddb.scan({ TableName: "Messages" }).promise();
            expect(item).toEqual(expected.Items);
        });

        it("should add a new message to a channel", async () => {
            await msg.addNewMessage(testMessage3);
            ddb.get({
                TableName: "Messages",
                Key: {
                    channelID: "channel",
                    insertTime: 5
                }
            }).promise().then((item: GetItemOutput) => {
                expect(item.Item).toEqual(testMessage3);
            });

        });

        it("should delete all messages in a channel", async () => {
            await msg.deleteAllMessagesForChannel("channel");
            const item = ddb.scan({ TableName: "Messages" });
            expect(item.Count).toEqual(1);
        });

        it("should delete the specified message", async () => {
            await msg.deleteMessage("ID1", "channel", 1);
            const item = ddb.scan({ TableName: "Messages" });
            expect(item.Count).toEqual(2);
            expect(item.Items[0]).toEqual(testMessage2);
            expect(item.Items[1]).toEqual(testMessageChannel2);
        });

        it("should update the specified message", async () => {
            await msg.updateMessage(testMessageUpdate);
            const item = ddb.get({
                TableName: "Messages", Key: {
                    channelID: "channel",
                    insertTime: 1
                }
            });
            expect(item).toEqual(testMessageUpdate);
        });

    });

    describe("ProfileDAO", () => {
        const profile = new ProfileDAO(ddb);

        beforeEach(() => {
            return new Promise(((resolve) => {
                ddb.put({
                    TableName: "Profiles",
                    Item: {
                        firstName: "Test",
                        lastName: "User",
                        username: "TestUser",
                        profileImage: PROFILE_IMAGE_S3_PREFIX + DEFAULT_PROFILE_IMAGE,
                        status: "Lorem Ipsum"
                    }
                }).promise().then(() => {
                    resolve();
                });
            }));
        });
        afterEach(() => {
            return new Promise(((resolve) => {
                ddb.delete({
                    TableName: "Profiles",
                    Key: {
                        username: "testUser"
                    }
                }).promise().then(() => {
                    resolve();
                });
            }));
        });

        it("should create a new profile from basic user information", async () => {
            await profile.createProfile("test2", "new", "test");
            expect(ddb.get({
                TableName: "Profiles",
                Key: { username: "test2" }
            }).Item == null).toBeFalsy();
        });

        it("should update all data in a user's profile.  If data is missing, it is represented by white space", async () => {
            const testProfileUpdate: ProfileObject = {
                username: "testUser",
                firstName: "test",
                lastName: "user",
                phone: "5555555555",
                bio: "Lorem Ipsum",
                gender: "Male",
                dateOfBirth: null,
                citizenship: null,
                grade: 12,
                gradYear: 2000,
                previousCollegiate: null,
                street: null,
                unitNumber: null,
                city: null,
                province: null,
                country: null,
                postalCode: null,
                club: null,
                injuryStatus: null,
                instagram: null,
                languages: null,
                coachFirstName: null,
                coachLastName: null,
                coachPhone: null,
                coachEmail: null,
                parentFirstName: null,
                parentLastName: null,
                parentEmail: null,
                parentPhone: null,
                budget: null
            };
            await profile.updateProfile(testProfileUpdate);
            expect(ddb.get({
                TableName: "Profiles",
                Key: { username: "testUser" }
            })).toEqual(testProfileUpdate);
        });

        it("should update a user's status message", async () => {
            await profile.updateStatus("testUser", "updated");
            const item = ddb.get({
                TableName: "Profiles",
                Key: { username: "testUser" }
            }).Items.status;
            expect(item).toEqual("updated");
        });

        /*it("should update a user's profile picture", async () => {
            await profile.updateProfileImage(1, "testUser");
            const item = ddb.get({TableName: "Profiles", Key: {username: "testUser"}}).Items.profileImage;
            expect(item).toEqual(PROFILE_IMAGE_S3_PREFIX + "testUser.png");
        });*/

        it("should return all data in a user's profile", async () => {
            const item = await profile.getUserProfile("testUser");
            const expected = ddb.get({
                TableName: "Profiles",
                Key: { username: "Testuser" }
            });
            expect(item == expected.Items).toBeTruthy();
        });

    });

    describe("NotificationsDAO", () => {
        let notificationDAO = new NotificationsDAO(ddb);

        beforeEach(() => {
            return new Promise((resolve => {

                ddb.put({
                    TableName: "Notifications",
                    Item: {
                        notificationId: "NID01",
                        insertedTime: 123456,
                        username: "testUser1",
                        channelId: "CID1",
                        channelName: "testChannel",
                        type: "public",
                        message: "Lorem Ipsum",
                        fromFriend: "testUser2"
                    }
                }).promise().then(() => {
                    ddb.put({
                        TableName: "Notifications",
                        Item: {
                            notificationId: "NID02",
                            insertedTime: 1234567,
                            username: "testUser1",
                            channelId: "CID1",
                            channelName: "testChannel",
                            type: "public",
                            message: "Lorem Ipsum",
                            fromFriend: "testUser2"
                        }
                    }).promise().then(() => {
                        resolve();
                    });
                });

            }));
        });

        afterEach(() => {
            return new Promise(resolve => {

                ddb.delete({
                    TableName: "Notifications",
                    Key: {
                        notificationId: "NID01",
                        insertedTime: 123456
                    },
                    ConditionExpression: "notificationId = :notificationId and insertedTime = :i",
                    ExpressionAttributeValues: {
                        ":notificationId": "NID01",
                        ":i": 123456
                    }
                }).promise().then(() => {
                    ddb.delete({
                        TableName: "Notifications",
                        Key: {
                            notificationId: "NID02",
                            insertedTime: 1234567
                        },
                        ConditionExpression: "notificationId = :notificationId and insertedTime = :i",
                        ExpressionAttributeValues: {
                            ":notificationId": "NID02",
                            ":i": 1234567
                        }
                    }).promise().then(() => {
                        resolve();
                    });
                });

            });
        });

        it("should return all notifications for a user", async () => {
            let call = await notificationDAO.getAllNotificationsForUser("testUser1");
            ddb.query({
                TableName: "Notifications",
                IndexName: "username-insertedTime-index",
                KeyConditionExpression: "username = :username",
                ExpressionAttributeValues: {
                    ":username": "testUser1"
                }
            }).promise().then((item: QueryOutput) => {
                expect(call).toEqual(item.Items);
            });
        });

        it("should return all friend requests from a user", async () => {
            let call = await notificationDAO.getAllFriendRequestsFromUser("testUser2");
            ddb.query({
                TableName: "Notifications",
                IndexName: "fromFriend-index",
                KeyConditionExpression: "fromFriend = :fromFriend",
                ExpressionAttributeValues: {
                    ":fromFriend": "testUser2"
                }
            }).promise().then((item: QueryOutput) => {
                expect(call).toEqual(item.Items);
            });
        });

        it("should return all notifications from a channel", async () => {
            let call = await notificationDAO.getAllNotificationsForChannel("CID1");
            ddb.query({
                TableName: "Notifications",
                IndexName: "channelId-insertedTime-index",
                KeyConditionExpression: "channelId = :channelId",
                ExpressionAttributeValues: {
                    ":channelId": "CID1"
                }
            }).promise().then((item: QueryOutput) => {
                expect(call).toEqual(item.Items);
            });
        });

        it("should return all notifications from a channel for a user", async () => {
            let call = await notificationDAO.getAllNotificationsForChannelAtUsername("CID1", "testUser1");
            ddb.query({
                TableName: "Notifications",
                IndexName: "channelId-insertedTime-index",
                KeyConditionExpression: "channelId = :c",
                FilterExpression: "username = :u",
                ExpressionAttributeValues: {
                    ":c": "CID1",
                    ":u": "testUser1"
                }
            }).promise().then((item: QueryOutput) => {
                expect(call).toEqual(item.Items);
            });
        });

        it("should create a new notification from an object", async () => {
            let testNotification: NotificationObject = {
                notificationId: "NID03",
                insertedTime: 12345678,
                username: "testUser1",
                channelId: "C1D1",
                channelName: "channel",
                channelType: "public",
                type: "public",
                message: "Lorem Ipsum",
                fromFriend: "testUser2"
            };

            await notificationDAO.createNewNotification(testNotification);
            ddb.get({
                TableName: "Notifications",
                Key: {
                    notificationId: "NID03",
                    insertedTime: 12345678
                }
            }).promise().then((item: GetItemOutput) => {
                expect(item.Item).toEqual({
                    notificationId: "NID03",
                    insertedTime: 12345678,
                    username: "testUser1",
                    channelId: "C1D1",
                    channelName: "channel",
                    channelType: "public",
                    type: "public",
                    message: "Lorem Ipsum",
                    fromFriend: "testUser2"
                });
                console.log("here");
                ddb.delete({
                    TableName: "Notifications",
                    Key: {
                        notificationId: "NID03",
                        insertedTime: 12345678
                    },
                    ConditionExpression: "notificationId = :notificationId and insertedTime = :i",
                    ExpressionAttributeValues: {
                        ":notificationId": "NID03",
                        ":i": 12345678
                    }
                }).promise().then(() => {
                    return;
                });
            });

        });

        it("should delete a notification from the database", async () => {
        });
    });

    describe("SettingsDAO", () => {

        let settings = new SettingsDAO(ddb);

        beforeEach(() => {
            return new Promise(((resolve) => {
                ddb.put({
                    TableName: "Settings",
                    Item: {
                        username: "testUser",
                        theme: "dark",
                        explicit: true
                    }
                }).promise().then(() => {
                    resolve();
                });
            }));
        });
        afterEach(() => {
            return new Promise(((resolve) => {
                ddb.delete({
                    TableName: "Settings",
                    Key: {
                        username: "testUser"
                    }
                }).promise().then(() => {
                    resolve();
                });
            }));
        });

        it("should create settings information for a user", async () => {
            await settings.createSettingsInfo("testUser", "dark");
            ddb.get({
                TableName: "Settings",
                Key: { username: "testUser" }
            }).promise().then((item: GetItemOutput) => {
                expect(item.Item).toEqual({
                    theme: "dark",
                    username: "testUser"
                });
            });
        });

        it("should get settings information for a user", async () => {
            const call: Array<SettingsObject> = await settings.getSettingsInfoByUsername("testUser");
            ddb.get({
                TableName: "Settings",
                Key: { username: "testUser" }
            }).promise().then((item: GetItemOutput) => {
                expect(call[0]).toEqual(item.Item);
            });
        });

        it("should update a user's settings", async () => {
            await settings.updateSettings("testUser", "light", false);
            ddb.scan({ TableName: "Settings" }).promise().then((data: ScanOutput) => {
                expect(data.Count).toEqual(1);
                ddb.get({
                    TableName: "Settings",
                    Key: { username: "testUser" }
                }).promise().then((item: GetItemOutput) => {
                    expect(item.Item.theme).toEqual("light");
                    expect(item.Item.explicit).toBeTruthy();
                });
            });
        });

    });
});
