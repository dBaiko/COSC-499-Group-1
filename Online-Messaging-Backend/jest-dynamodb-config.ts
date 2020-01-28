module.exports = {
    tables: [
        {
            TableName: `Users`,
            KeySchema: [{AttributeName: "id", KeyType: "HASH"}],
            AttributeDefinitions: [{AttributeName: "id", AttributeType: "S"}],
            ProvisionedThroughput: {ReadCapacityUnits: 1, WriteCapacityUnits: 1},
        },
        // etc
    ],
};