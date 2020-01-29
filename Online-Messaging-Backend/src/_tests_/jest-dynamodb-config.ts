module.exports = {
    tables: [
        {
            TableName: `Users`,
            KeySchema: [{ AttributeName: "username", KeyType: "HASH" }],
            AttributeDefinitions: [
                { AttributeName: "email", AttributeType: "S" },
                { AttributeName: "firstName", AttributeType: "S" },
                { AttributeName: "lastName", AttributeType: "S" }
            ],
            ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
        },
        {
            TableName: `Messages`,
            KeySchema: [
                { AttributeName: "channelId", KeyType: "HASH" },
                { AttributeName: "insertTime", KeyType: "RANGE" }
            ],
            AttributeDefinitions: [
                { AttributeName: "content", AttributeType: "S" },
                { AttributeName: "messageId", AttributeType: "S" },
                { AttributeName: "username", AttributeType: "S" }
            ],
            ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
        },
        {
            TableName: `Channel`,
            KeySchema: [
                { AttributeName: "channelId", KeyType: "HASH" },
                { AttributeName: "channelType", KeyType: "RANGE" }
            ],
            AttributeDefinitions: [
                { AttributeName: "channelType", AttributeType: "S" }
            ],
            ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
        },
        {
            TableName: `UserChannel`,
            KeySchema: [
                { AttributeName: "username", KeyType: "HASH" },
                { AttributeName: "channelId", KeyType: "RANGE" }
            ],
            AttributeDefinitions: [
                { AttributeName: "channelType", AttributeType: "S" },
                { AttributeName: "channelName", AttributeType: "S" },
                { AttributeName: "userChannelRole", AttributeType: "S" }
            ],
            ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
        }
    ]

};

