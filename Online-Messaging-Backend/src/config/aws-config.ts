// replace with path on running machine
//export const awsConfigPath = "/Users/karanmeetkhatra/Documents/AWSJustForDylansPurposes/aws-dynamodb-config.json";
//export const awsConfigPath = "D:\\School\\COSC499\\Project Secrets\\aws-dynamodb-config.json";
export const awsConfigPath = "C:\\Users\\dylan\\Documents\\Intellij Workspace\\AWS\\aws-dynamodb-config.json";
//export const awsConfigPath = "C:\\Users\\Micha\\aws\\aws-dynamodb-config.json";
//export const awsConfigPath = "D:\\School\\COSC499\\Project Secrets\\aws-dynamodb-config.json"
// export const awsConfigPath = "/home/ubuntu/aws-dynamodb-config.json";

import { JWK } from "jwk-to-pem";

export const awsCognitoConfig: JWK = {
    e: "AQAB",
    kty: "RSA",
    n:
        "g1D17h6URfw7xJcaeryvK4ySkOfKnRf5C3hEHIkF7s0CNHR9oLiLwSsN6zbM3wsa0pWvxND2Cjh-wRuSWcddqvjzqyuNlwasbFiPrQ8k2B9f_7fJV4RJKmI1RvkzuHJRugAHdlxWyTCOkJ2WMRqZmd2OieDQC_TlOF2bCcnGu8_Ai1wTxW8FT7BBgRI2aMAcZ5IPNxHEoJNFR2aZqwSqSi0L8X4rXDHgcCyw4IIOfPpez-ctcj0vSWrNs2vZTZVqKzMPbG8dNDOFcSMX_L8TsJ9uXbxEhOorRBUh49G9fsMIYbsvCI6tMhvuDqeDqu-LQRphJSO83cJql7jOn4QjrQ"
};

export const UserPoolConfig = {
    UserPoolURL: "https://cognito-idp.ca-central-1.amazonaws.com/",
    UserPoolId: "ca-central-1_6ickHVand",
    ClientId: "2n7od4b3prkjdc9trthuf3d92q",
    ExpectedTokenUse: "id"
};

export const AWSS3Config = {
    endpoint: "s3.ca-central-1.amazonaws.com",
    bucket: "streamline-athletes-messaging-app",
    imagesFolder: "user-profile-images/"
};

export const TestUserData = {
    testUsername: "TestUser",
    testPassword: "password",
    correctAdminPassword: "admin"
};
