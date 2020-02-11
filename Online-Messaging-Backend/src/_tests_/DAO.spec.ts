import MessageDAO from "../routes/messages/MessageDAO";
import UserDAO from "../routes/users/UserDAO";
import ChannelDAO from "../routes/channels/ChannelDAO";
import UserChannelDAO from "../routes/userChannels/UserChannelDAO";

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

const user = new UserDAO(ddb);
it("should create a new user in the table", async () =>
{
   await user.createNewUser("testUser", "testUser@nothing.com", "Lorem", "Ipsum");
   const item = await ddb.get({TableName: "Users", Key: {username: "testUser"}}).promise();
   expect(item).toEqual({
       username: "testUser",
       email: "testUser@nothing.com",
       firstName: "Lorem",
       lastName: "Ipsum",
   });
});
it("should get user information by username", async () =>
{
    const response = await user.getUserInfoByUsername("testUser");
    const item = await ddb.get({TableName: "Users", Key: {username: "testUser"}}).promise();
    expect(item).toEqual(response);
});

const channel = new ChannelDAO(ddb);
it("should create a new channel", async () =>
{
   await channel.addNewChannel("testChannel", "public", "testUser",
        "admin");
    const item = await ddb.get({TableName: "Channels", Key: {channelId: "testChannel", channelType: "public"}})
        .promise();
    expect(item).toEqual({
        channelId: "testChannel",

    });
});
it("should retrieve certain information about a channel", async() =>
{

});
it("should return a list of all channels", async() =>
{

});

const msg = new MessageDAO(ddb);
it("should retrieve the message history for a given channel", async() =>
{

});
it("should get all messages from all channels", async() =>
{

});
it("should add a new message to the file", async() =>
{
    msg.addNewMessage("Lorem Ipsum");

});

const userChannel = new UserChannelDAO(ddb);
it("should subscribe a user to a channel", async() =>
{

});
it("should return a list of channels a user is subscribed to", async() =>
{

});
it("should return a list of all users subscribed to a channel", async() =>
{

});
it("should return all users and all channels they are subscribed to", async() =>
{

});