import UserDAO from "../routes/users/UserDAO";
import ChannelDAO from "../routes/channels/ChannelDAO";
import UserChannelDAO from "../routes/userChannels/UserChannelDAO";
import {MessageDAO} from "../routes/messages/MessageDAO";
import {ProfileDAO} from "../routes/profiles/ProfileDAO";
import {NotificationsDAO} from "../routes/notifications/NotificationsDAO";
import SettingsDAO from "../routes/settings/settingsDAO";

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
        ddb.put({
            TableName: "Users",
            Item: {
                username: "testUser",
                email: "testUser@nothing.com"
            }
        });
    });
    afterEach(() => {
        ddb.delete({
            TableName: "Users",
            Key: {
                username: "testUser",
            }
        })
    });

    it("should create a new user in the table", async () => {
        await user.createNewUser("testUser2", "testUser2@nothing.com");
        const item = await ddb.get({TableName: "Users", Key: {username: "testUser"}}).promise();
        expect(item).toEqual({
            Item: {
                username: "testUser2",
                email: "testUser2@nothing.com",
            }
        });
        ddb.delete({
            TableName: "Users",
            Key: {
                username: "testUser2",
            }
        })
    });

    it("should get user information by username", async () => {
        const item = await user.getUserInfoByUsername("testUser");
        expect(item).toEqual([
            {
                username: "testUser",
                email: "testUser@nothing.com",
            }
        ]);
    });

    it("should update a user's email address by username", async () => {
        await user.updateUser("testUser", "testUpdate@nothing.com");
        const item = await user.getUserInfoByUsername("testUser");
        expect(item).toEqual([
            {
                username: "testUser",
                email: "testUpdate@nothing.com",
            }
        ]);
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
            ddb.scan("Users").Items.sort(
                (a: UserObject, b: UserObject) => (a.username > b.username ? 1 : -1)).promise()
        ])
    });
});

describe("ChannelDAO", () => {

    const channel = new ChannelDAO(ddb);

    beforeEach(() => {
        ddb.put({
            TableName: "Channels",
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
        });
    });
    afterEach(() => {
        ddb.delete({
            TableName: "Channels",
            Key: {
                channelID: "ID01",
                channelName: "testUser"
            }
        })
    });

    it("should create a new channel", async () => {
        await channel.addNewChannel("testChannel",
            "public",
            "testDescript",
            "testUser",
            "admin",
            "true",
            PROFILE_IMAGE_S3_PREFIX + DEFAULT_PROFILE_IMAGE);
        const item = await ddb.scan({TableName: "Channel"}).promise();
        delete item.Items[0].channelId;
        expect(item).toEqual({
            Count: 1,
            Items: [
                {
                    channelName: "testChannel",
                    channelType: "public"
                }
            ],
            ScannedCount: 1
        });
    });

    it("should retrieve certain information about a channel", async () => {
        const testChannelScan = await ddb.scan({TableName: "Channel"}).promise();
        let channelId = testChannelScan.Items[0].channelId;
        const call = await channel.getChannelInfo(channelId);
        const item = await ddb
            .get({TableName: "Channel", Key: {channelId: channelId, channelName: "testChannel"}})
            .promise();
        let expectedItem = [item.Item];
        expect(call).toEqual(expectedItem);
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
        ddb.put({
            TableName: "UserChannel",
            Item: {
                username: "testUser",
                channelId: "ID01",
                userChannelRole: "admin",
                channelName: "channel",
                channelType: "public",
                profileImage: PROFILE_IMAGE_S3_PREFIX + DEFAULT_PROFILE_IMAGE,
            }
        });
    });
    afterEach(() => {
        ddb.delete({
            TableName: "UserChannel",
            Key: {
                username: "testUser",
                channelId: "ID01"
            }
        })
    });

    it("should return all users and all channels they are subscribed to", async () => {
    });

    it("should subscribe a user to a channel", async () => {
    });

    it("should return a list of channels a user is subscribed to", async () => {
    });

    it("should return a list of all users subscribed to a channel", async () => {
    });

    it("should delete a subscription between a specified user and channel", async () => {
    });

    it("should update a displayed profile picture across a user's subscribed channels", async () => {
    });

    it("should update a user's displayed status across all subscribed channels", async () => {
    });
});

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
        channelType: "Public",
    };
    const testMessage2: Message = {
        channelId: "channel",
        username: "testUser",
        content: "content2",
        messageId: "ID2",
        insertTime: 2,
        profileImage: PROFILE_IMAGE_S3_PREFIX + DEFAULT_PROFILE_IMAGE,
        deleted: "no",
        channelType: "Public",
    };
    const testMessageUpdate: Message = {
        channelId: "channel",
        username: "testUser",
        content: "content3",
        messageId: "ID1",
        insertTime: 1,
        profileImage: PROFILE_IMAGE_S3_PREFIX + DEFAULT_PROFILE_IMAGE,
        deleted: "no",
        channelType: "Public",
    };

    it("should retrieve the message history for a given channel", async () => {
    });

    it("should get all messages from all channels", async () => {
    });

    it("should add a new message to a channel", async () => {
        await msg.addNewMessage(testMessage1);
        const item = ddb.get({
            TableName: "Messages",
            Key: {
                channelID: "channel",
                messageID: "ID1"
            }});
            expect(item).toEqual(testMessage1);
        });

    it("should delete all messages in a channel", async () => {
    });

    it("should delete the specified message", async () => {
    });

    it("should update the specified message", async () => {
    });

});

describe("ProfileDAO", () => {

    const profile = new ProfileDAO(ddb);

    beforeEach(() => {
        ddb.put({
            TableName: "Profiles",
            Item: {
                firstName: "Test",
                lastName: "User",
                username: "TestUser",
                profileImage: PROFILE_IMAGE_S3_PREFIX + DEFAULT_PROFILE_IMAGE,
                status: "Lorem Ipsum"
            }
        });
    });
    afterEach(() => {
        ddb.delete({
            TableName: "Profiles",
            Key: {
                username: "testUser",
            }
        })
    });

    it("should create a new profile from basic user information", async () => {
    });

    it("should update all data in a user's profile", async () => {
    });

    it("should update a user's status message", async () => {
    });

    it("should update a user's profile picture", async () => {
    });

    it("should return all data in a user's profile", async () => {
    });

});

describe("NotificationsDAO", () => {

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
});

describe("SettingsDAO", () => {

    const settings = new SettingsDAO(ddb);

    beforeEach(() => {
        ddb.put({
            TableName: "Settings",
            Item: {
                username: "testUser",
                theme: "dark"
            }
        });
    });
    afterEach(() => {
        ddb.delete({
            TableName: "Settings",
            Key: {
                username: "testUser",
            }
        })
    });

    it("should create settings information for a user", async () => {
    });

    it("should get settings information for a user", async () => {
    });

    it("should update a user's settings", async () => {
    });

});
