module.exports = {
    tables: [
        {
            TableName: `Users`,
            KeySchema: [{ AttributeName: "username", KeyType: "HASH" }],
            AttributeDefinitions: [
                { AttributeName: "username", AttributeType: "S" }
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
                { AttributeName: "channelId", AttributeType: "S" },
                { AttributeName: "insertTime", AttributeType: "N" }
            ],
            ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
        },
        {
            TableName: `Channel`,
            KeySchema: [
                { AttributeName: "channelId", KeyType: "HASH" },
                { AttributeName: "channelName", KeyType: "RANGE" }
            ],
            AttributeDefinitions: [
                { AttributeName: "channelId", AttributeType: "S" },
                { AttributeName: "channelName", AttributeType: "S" }
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
                { AttributeName: "username", AttributeType: "S" },
                { AttributeName: "channelId", AttributeType: "S" }
            ],
            ProvisionedThroughput: { ReadCapacityUnits: 10, WriteCapacityUnits: 10 }
        },
        {
            TableName: `Profiles`,
            KeySchema: [
                { AttributeName: "username", KeyType: "HASH" }
            ],
            AttributeDefinitions: [
                { AttributeName: "username", AttributeType: "S" },
            ],
            ProvisionedThroughput: { ReadCapacityUnits: 10, WriteCapacityUnits: 10 }
        },
        {
            TableName: `Settings`,
            KeySchema: [
                { AttributeName: "username", KeyType: "HASH" }
            ],
            AttributeDefinitions: [
                { AttributeName: "username", AttributeType: "S" },
            ],
            ProvisionedThroughput: { ReadCapacityUnits: 10, WriteCapacityUnits: 10 }
        },
        {
            TableName: `Notifications`,
            KeySchema: [
                { AttributeName: "notificationId", KeyType: "HASH" },
                { AttributeName: "insertedTime", KeyType: "RANGE" }
            ],
            AttributeDefinitions: [
                { AttributeName: "notificationId", AttributeType: "S" },
                { AttributeName: "insertedTime", AttributeType: "N" }
            ],
            ProvisionedThroughput: { ReadCapacityUnits: 10, WriteCapacityUnits: 10 }
        }
]
};
