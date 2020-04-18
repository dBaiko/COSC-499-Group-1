import UserDAO from "../routes/users/UserDAO";
import ChannelDAO from "../routes/channels/ChannelDAO";
import UserChannelDAO from "../routes/userChannels/UserChannelDAO";
import {MessageDAO} from "../routes/messages/MessageDAO";
import SettingsDAO from "../routes/settings/settingsDAO";
import {ProfileDAO, ProfileObject} from "../routes/profiles/ProfileDAO";
import {GetItemOutput, QueryOutput, ScanOutput} from "aws-sdk/clients/dynamodb";

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

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

jest.setTimeout(30000);

const {DocumentClient} = require("aws-sdk/clients/dynamodb");

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
        const item = await ddb.get({TableName: "Users", Key: {username: "testUser2"}}).promise();
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
        const item = await ddb.get({TableName: "Users", Key: {username: "testUser"}}).promise();
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
        ddb.scan({TableName: "Users"}).promise().then((data: ScanOutput) => {
            expect(item).toEqual(data.Items)
        });

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
                TableName: "Channel",
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
        const item = await ddb.scan({TableName: "Channel"}).promise();
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
        const testChannelScan = await ddb.scan({TableName: "Channel"}).promise();
        let channelId = testChannelScan.Items[0].channelId;
        const call: ChannelObject = await channel.getChannelInfo(channelId);
        const item = await ddb
            .get({TableName: "Channel", Key: {channelId: channelId, channelName: "testChannel"}})
            .promise();
        let expectedItem = item.Item;
        expect(expectedItem).toEqual(call);
    });

    it("should return a list of all channels", async () => {
        const list = await channel.getAllChannels();
        const item = await ddb.scan({TableName: "Channel"}).promise();
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
            }).promise().then(() => {
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
                }).promise().then(() => {
                    ddb.put({
                        TableName: "UserChannel",
                        Item: {
                            username: "testUser2",
                            channelId: "ID01",
                            userChannelRole: "user",
                            channelName: "channel",
                            channelType: "public",
                            profileImage: PROFILE_IMAGE_S3_PREFIX + DEFAULT_PROFILE_IMAGE
                        }
                    }).promise().then(() => {
                        resolve();
                    });
                });
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
                },
                ConditionExpression: "username = :u and channelId = :c",
                ExpressionAttributeValues: {
                    ":u": "testUser",
                    ":c": "ID01"
                }
            }).promise().then(() => {
                ddb.delete({
                    TableName: "UserChannel",
                    Key: {
                        username: "testUser",
                        channelId: "ID02"
                    },
                    ConditionExpression: "username = :u and channelId = :c",
                    ExpressionAttributeValues: {
                        ":u": "testUser",
                        ":c": "ID02"
                    }
                }).promise().then(() => {
                    ddb.delete({
                        TableName: "UserChannel",
                        Key: {
                            username: "testUser2",
                            channelId: "ID01"
                        },
                        ConditionExpression: "username = :u and channelId = :c",
                        ExpressionAttributeValues: {
                            ":u": "testUser2",
                            ":c": "ID01"
                        }
                    }).promise().then(() => {
                        resolve();
                    });
                });
            });
        }));
    });

    it("should return all users and all channels they are subscribed to", async () => {
        const item = await ddb.scan({TableName: "UserChannel"}).promise();
        const actual = await userChannel.getAll();
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
        const get = ddb.get({TableName: "UserChannel", Key: {username: "addTest", channelId: "ID01"}});
        await userChannel.deleteChannelSubscription("addTest", "ID01");
        expect(item).toEqual(get.Items);
    });

    it("should return a list of channels a user is subscribed to", async () => {
        const item = await userChannel.getAllSubscribedChannels("testUser");
        const expected = await ddb.query({
            TableName: "UserChannel",
            KeyConditionExpression: "username = :username",
            ExpressionAttributeValues: {":username": "testUser"}
        }).promise();
        expect(item).toEqual(expected.Items);
    });


    it("should return a list of all users subscribed to a channel", async () => {
        const item = await userChannel.getAllSubscribedUsers("ID01");
        const expected = await ddb.query({
            TableName: "UserChannel",
            IndexName: "channelId-username-index",
            KeyConditionExpression: "channelId = :channelId",
            ExpressionAttributeValues: {":channelId": "ID01"}
        }).promise();
        expect(item).toEqual(expected.Items);
    });

    it("should delete a subscription between a specified user and channel", async () => {
        await userChannel.deleteChannelSubscription("testUser2", "ID01");
        ddb.scan({TableName: "UserChannel"}).promise().then((item: ScanOutput) => {
            console.log(item.Count);
            expect(item.Count).toBe(2);
            ddb.put({
                TableName: "UserChannel",
                Item: {
                    username: "testUser2",
                    channelId: "ID01",
                    userChannelRole: "user",
                    channelName: "channel",
                    channelType: "public",
                    profileImage: PROFILE_IMAGE_S3_PREFIX + DEFAULT_PROFILE_IMAGE
                }
            }).promise().then(() => {
                return;
            });
        });

    });

    it("should update the user's displayed profile picture across all subscribed channels", async () => {
        await userChannel.updateProfilePicture("testUser");
        await delay(1000);
        ddb.query({
            TableName: "UserChannel",
            Key: {username: "testUser", channelId: "ID01"},
            KeyConditionExpression: "username = :username and channelId = :channelId",
            ExpressionAttributeValues: {":username": "testUser", ":channelId": "ID01"}
        }).promise().then((sub1: QueryOutput) => {
            expect(sub1.Items[0]).toEqual({
                username: "testUser",
                channelId: "ID01",
                userChannelRole: "admin",
                channelName: "channel",
                channelType: "public",
                profileImage: PROFILE_IMAGE_S3_PREFIX + "testUser.png"
            });
        });
        ddb.get({
            TableName: "UserChannel",
            Key: {username: "testUser", channelId: "ID02"}
        }).promise().then((sub2: GetItemOutput) => {
            expect(sub2.Item).toEqual({
                username: "testUser",
                channelId: "ID02",
                userChannelRole: "user",
                channelName: "channel2",
                channelType: "public",
                profileImage: PROFILE_IMAGE_S3_PREFIX + "testUser.png"
            });
        });
    });

    it("should update a user's displayed status across all subscribed channels", async () => {
        await userChannel.updateStatus("testUser", "Lorem Ipsum");
        await delay(1000);
        ddb.get({
            TableName: "UserChannel",
            Key: {username: "testUser", channelId: "ID01"}
        }).promise().then((sub1: GetItemOutput) => {
            expect(sub1.Item).toEqual({
                username: "testUser",
                channelId: "ID01",
                userChannelRole: "admin",
                channelName: "channel",
                channelType: "public",
                profileImage: PROFILE_IMAGE_S3_PREFIX + DEFAULT_PROFILE_IMAGE,
                statusText: "Lorem Ipsum"
            });
        });
        ddb.get({
            TableName: "UserChannel",
            Key: {username: "testUser", channelId: "ID02"}
        }).promise().then((sub2: GetItemOutput) => {
            expect(sub2.Item).toEqual({
                username: "testUser",
                channelId: "ID02",
                userChannelRole: "user",
                channelName: "channel2",
                channelType: "public",
                profileImage: PROFILE_IMAGE_S3_PREFIX + DEFAULT_PROFILE_IMAGE,
                statusText: "Lorem Ipsum"
            });
        });
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
        const expected = await ddb.scan({TableName: "Messages"}).promise();
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
        const item = ddb.scan({TableName: "Messages"});
        expect(item.Count).toEqual(1);
    });

    it("should delete the specified message", async () => {
        await msg.deleteMessage("ID1", "channel", 1);
        const item = ddb.scan({TableName: "Messages"});
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
            Key: {username: "test2"}
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
            Key: {username: "testUser"}
        })).toEqual(testProfileUpdate);
    });

    it("should update a user's status message", async () => {
        await profile.updateStatus("testUser", "updated");
        const item = ddb.get({
            TableName: "Profiles",
            Key: {username: "testUser"}
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
            Key: {username: "Testuser"}
        });
        expect(item == expected.Items).toBeTruthy();
    });

});

/*describe("NotificationsDAO", () => {

    const notification = new NotificationsDAO(ddb);
    it("should return all notifications for a user", async () => {

    });

    it("should return all friend requests from a user", async () => {
    });

    it("should return all notifications from a channel", async () => {
    });

    it("should return all notifications from a channel for a user", async () => {
    });

    it("should create a new notification from a socket", async () => {
    });

    it("should create a new notification from an object", async () => {
    });

    it("should delete a notification from the database", async () => {
    });
});*/

describe("SettingsDAO", () => {

    const settings = new SettingsDAO(ddb);

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
        await settings.createSettingsInfo("test2", "dark");
        const item = ddb.get({
            TableName: "Settings",
            Key: {username: "test2"}
        }).Items;
        expect(item.Theme).toEqual("dark");
        expect(item.explicit).toBeNull();
    });

    it("should get settings information for a user", async () => {
        const item = await settings.getSettingsInfoByUsername("testUser");
        const expected = ddb.get({
            TableName: "Settings",
            Key: {username: "testUser"}
        }).Items;
        expect(item).toEqual(expected);
    });

    it("should update a user's settings", async () => {
        await settings.updateSettings("testUser", "light", false);
        expect(ddb.scan({TableName: "Settings"}).Count).toEqual(1);
        const item = ddb.get({
            TableName: "Settings",
            Key: {username: "testUser"}
        }).Items;
        expect(item.theme).toEqual("light");
        expect(item.explicit).toBeTruthy();
    });

});
