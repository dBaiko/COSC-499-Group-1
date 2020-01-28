module.exports = {
    tables: [
        {
            TableName: `Users`,
            KeySchema: [{AttributeName: "UserID", KeyType: "HASH"}],
            AttributeDefinitions: [{AttributeName: "UserID", AttributeType: "string"}],
            ProvisionedThroughput: {ReadCapacityUnits: 1, WriteCapacityUnits: 1},
        },
        // etc
    ],

};
const {DocumentClient} = require("aws-sdk/clients/dynamodb");

const isTest = process.env.JEST_WORKER_ID;
const config = {
    convertEmptyValues: true,
    ...(isTest && {
        endpoint: "localhost:8000",
        sslEnabled: false,
        region: "local-env",
    }),
};

const ddb = new DocumentClient(config);