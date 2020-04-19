# Streamline Athletes - Messaging Application

#### _UBCO COSC 499 Capston Project 2020_

## Github repository
The github repository can be found [here](https://github.com/dBaiko/COSC-499-Group-1)

## Table of Contents

<details>
    <summary>Click to expand</summary>

- [Intro](#intro)
- [Repository Overview](#repository-overview)
  * [Folders](#folders)
    + [Online-Messaging-App](#online-messaging-app)
    + [Online-Messageing-Backend](#online-messageing-backend)
  * [Branches](#branches)
  * [License](#license)
- [Installation Guide](#installation-guide)
  * [Setting Up On a Local Machine](#setting-up-on-a-local-machine)
  * [AWS Setup](#aws-setup)
    + [Cognito Setup](#cognito-setup)
    + [DynamoDB Setup](#dynamodb-setup)
      - [Pre-setup: Security](#pre-setup--security)
      - [DynamoDB](#dynamodb)
    + [_Aside_](#-aside-)
    + [S3 Setup](#s3-setup)
      - [_Aside_](#-aside--1)
  * [Running the application locally](#running-the-application-locally)
  * [Running The Application On A Server](#running-the-application-on-a-server)
  
</details>

## Intro

The Streamline Athletes messaging application is a live interactable channel based chat application to serve as the chat
functionality for Streamline Athletes existing website. The app was built for the UBCO COSC 499 Capstone software engineering
project.

The application is a web application, with two seperate ends. The front end is an [Angular](https://angular.io/) application designed intended
to run on a clients web browser, the backend is a [Express.js](https://expressjs.com/) api server to handle data management. Both of which can 
be served by [Node.js](https://nodejs.org/en/). All live comunication is handled via [Socket.io](https://socket.io/) All persistant data storage is handled via [AWS](https://aws.amazon.com/) services.

The database is a series of DynamoDB tables. The image storage is contained in a S3 bucket. And the user authentication
is handled by AWS Cognito.

The project is split into the front and back ends, and run as seperate programs, which simply interact with each other.

## Repository Overview

The repository contains two folders, `Online-Messaging-App`, and `Online-Messaging-Backend`. Each of which contain their
respective applications. Although these applications are in the same repository, they do not share any dependencies, nor
is there any build scripts in place to build both applications from one root source at this time.

### Folders

#### Online-Messaging-App

This folder contains all the necessary files pertaining to the frontend of the application. It is a Node program, and as
such is ran, tested, and built via `npm` and it's `package.json` file. The source code for the application is under the
`src` folder. The application will run via Angular's development suite in test, and via `node` in production. This
folder does not contain any data or files generated dynamically upon build or run time. (i.e dist or node_modules folders). 

#### Online-Messageing-Backend

This folder contains all the neccessary files pertaining to the backend of the application. It is a Node program, and as
such is ran, tested and built via `npm`, and it's `package.json` file. The source code for the application is under the 
`src` folder. The application will run via `node`. This folder does not contain any data or files generated dynamically upon build or run time. (i.e dist or node_modules folders).

### Branches

The branches are as follows:
* develop: Default branch. Contains the master copy of the development code. In other words code of this branch is the
most up to date with the latest features of the project, however, it's configuration is set up to run in development/test
only, where the two applications will run locally on your machine. This branch should not be used for production.
* frontend: A sub branch of develop, used to delegate work exclusively on the frontend, to avoid conflicts with work on
the backend.
* backend: A sub branch of develop, used to delegate work exclusively on the backend, to avoid conflicts with work on
the frontend.
* release: Production branch. Up to date with latest features and code, however set up with configuration to run in 
production. Code here will not run locally.
* master: unused.

### License

**Note:** No license has been applied to the code base and doing so in the future, or at all, will be under the sole discretion of
_Streamline Athletes_.

## Installation Guide

The installation guide will consist of 4 parts. The first to set up the repository on a local machine, the second to set up the AWS services, the third to get the application running locally after AWS services have been setup, and the forth, to set up a release version of the project.

### Setting Up On a Local Machine

1. Ensure [Node.js](https://nodejs.org/en/) is installed on your machine in order to run locally.
2. Clone the [repository](https://github.com/dBaiko/COSC-499-Group-1) into a working directory on your machine.
3. Open the repository in your IDE of choice, and go through your usual steps to open it as a project within the IDE.
4. If your IDE prompts you to install dependencies do so, if not open a terminal which has access to `npm` and do the
following: 
   * ```bash
     npm i @angular/cli -g --save-dev
     npm i express -g  --save-dev
     cd Online-Messaging-App
     npm install
     cd ../Online-Messaging-Backend
     npm install
     ```
5. At this point you have the project, however it will not run with out new configs to point to all of the new AWS
services, so proceed to AWS setup.

### AWS Setup

**Note:** The AWS setup assumes your AWS user is root, or has root access. The AWS services used were always entirely 
free teir, except for any secondary index's on DynamoDB tables, which do cost a little, as well as when the S3 bucket
went over the free teir limit of 20'000 requests near the end of development. It is to your discretion to upgrade the
services used to paid ones, but please note that that the instructions to follow may not match exactly as what you do
in this case. Finally, please note that all services used, were used entirely through the consoles on the AWS website.
It is possible to use installable versions of at least DynamoDB, but there will be no instructions on how to do so.

#### Cognito Setup

1. On the AWS site, navigate to the Cognito service, and click `Create a user pool` in the top right.
2. You will be prompted to give the pool a name. Name it something you can remember, and there cannot be spaces in the name.
3. Once you give it a name, click `Step through settings`
4. You will be greeted with `How do you want your end users to sign in?`, and two lists. One is Username, and the other
is Email address. Leave it on the default of `Username`, and under the list click `Also allow sign in with verified email address`
5. Below the two lists, uncheck the option `Enable case insentivity for username input`.
6. Scroll down, and under `Which standard attributes do you want to require?` choose: email, family name, given name
7. Click `Next step`
8. This page is all about passwords.
   * For minimum length, keep the default of 8
   * For the remaining checkbox's below, uncheck everything
1. Under `Do you want to allow users to sign themselves up?`, ensure `Allow users to sign themselves up` is checked.
1. Under `How quickly should temporary passwords set by administrators expire if not used?`, keep the default of `7`.
1. Click `Next step`
1. Under `Do you want to enable Multi-Factor Authentication (MFA)?` choose `off`
1. Under `How will a user be able to recover their account?` choose `Not Recommended) Phone if available, otherwise email, and do allow a user to reset their password via phone if they are also using it for MFA.`
1. Under `Which attributes do you want to verify?` choose `No verification`
1. Ignore The `You must provide a role to allow Amazon Cognito to send SMS messages` portion
1. Click `Next step`
1. On this next page ignore everything and click `Next step` (this feature is never used)
1. On this next page, no tags are needed so click `Next step`
1. On this next page, leave it at the default "No", and click `Next step`
1. On this page, click `Add an app client`
   1. Name the client: "Online-Messaging-App" without the quotes
   1. Leave refresh token at 30 days. (This is not the JWT refresh rate, that's every hour)
   1. Uncheck "Generate Client Secret"
   1. Leave all remaining settings default
   1. Click "Create app client"
1. Click "Next step"
1. On this page we will leave everything default, but we will come back to this page later.
1. Click "Next step"
1. Review your settings one final time, then click "Create Pool"
1. At this point, we have some config information to add to the application.
   1. Under "General settings" note the first value shown: "Pool Id". Copy the value then switch to your IDE
   1. Open the file: under Online-Messaging-App, `src/app/shared/app-config.ts`
   1. In the definition of `CognitoConfig`, replace the value of `UserPoolId` with your user pool id you just copied
   1. In the left hand sidebar, click "App client settings"
   1. Under App client, copy the value next to "ID"
   1. Back in your IDE, replace the value of `ClientId` with the value you just copied.
   1. At this point your `CognitoConfig` should look like this:
      * ```
        export const CognitoConfig = {
            UserPoolId: "<your-user-pool-id>",
            ClientId: "<your-client-id>"
        };
        ```
   1. Now open the file, under Online-Message-Backend, `src/config/aws.config.ts`
   1. In the definition of `UserPoolConfig` replace the following values:
        * `UserPoolURL` with "https://cognito-idp.<your-region>.amazonaws.com/"
        * `UserPoolId`: "<your-user-pool-id>"
        * `ClientId` : "<your-client-id>"
   1. Now the tricky part. Retrieving the JWT verification public keys
        * In your web browser, navigate to: https://cognito-idp.<your-region>.amazonaws.com/<your-user-pool-id>/.well-known/jwks.json
        * From what's shown here we must extract three value.
        * If it helps, copy the output and paste into a pretty printer
        * The JSON will be an array of two Key elements. We'll focus on the first one.
        * Open in your IDE, under Online-Message-Backend, `src/config/aws.config.ts`
        * In the definition of awsCognitoConfig, replace the following values:
            * e with the e value given in th first element in the array outpt
            * key with the kty value given
            * n with the long n value given
        * This tricky little step is to give the application the public key needed to verify the JWT token's given from
        cognito
1. We are done with Cognito for now, under services search for "Lambda", and go to that console.
1. Click create function
1. Choose the following options:
   1. In the first three buttons, leave it on "Author from scratch"
   1. In function name, name the function "autoConfirm"
   1. Leave Runtime at default
   1. Under Execution role, choose "Create a new role with basic Lambda permissions"
1. Click "Create function"
1. Wait for a green banner to tell you that the function has been successfully created
1. Scroll down "Function Code"
1. Replace the code with:
   * 
   ```javascript
   exports.handler = (event, context, callback) => {
       event.response.autoConfirmUser = true;
       event.response.autoVerifyEmail = true;
       context.done(null, event);
   };
   ```
1. And click Save in the top right hand corner. Ensure you get the green success banner.
2. In the top header, under services, Navigate back to the Cognito console, click "Manage User Pools", then click user
pool you just created earlier.
1. In the left hand sidebar, click "Triggers"
1. Under "Pre sign-up", the Lambda function you just created, "autoConfirm", should be in the drop down. Select it.
   * What this is doing, is by-passing the confirm email requirement of Cognito. There is no configuration that simply
   allows your users to not have to confirm the email, so this work around will do.
1. Scroll down to the bottom and click "Save changes"

At this point, Cognito is fully set up.

#### DynamoDB Setup

##### Pre-setup: Security

1. In the AWS Main console, under services, search for: IAM
1. In the left hand sidebar, click "Groups"
1. Click "Create New Group".
1. Name the group "streamline-athletes-messaging", and click "Next Step"
1. Check "AmazonS3FullAccess" (actually for much later, but while were here)
1. Click Next Step, then "Create Group"
1. In the left hand sidebar, click "Users", then "Add user"
1. In the Username, give it a unique username
1. In "Access type" select "Programmatic access"
1. Click "Next: Permissions"
1. Select "Attach existing policies directly", then search for "AmazonDynamoDBFullAccess"
1. Click "Next: Tags", then "Next: Review"
1. Review settings, then click "Create user"
1. STOP, DO NOT NAVTIGATE AWAY FROM THIS PAGE
   * This is the one and only time you will be given your secret access key, required to do anything with DynamoDB
   * At this point create a new file somewhere safe and secure on your computer. Call it `aws-dynamodb-config.json`. Do not put this file in the same directory as the project repository. _(If this file accidentally ends up on the repository, and the pushed up, BitCoin mining hackers WILL scrape it from Github, and use the credentials to create as many EC2 instances as possible, racking up a massive bill until finally AWS disables your account and flags your repo as unsafe. Unfortunately, I am speeking from experience.)_
   * In the file put the following contents:
        *
        ```json
        {
          "accessKeyId": "<your-access-key>",
          "secretAccessKey": "<your-secret-access-key>",
          "region": "<your-region>",
          "endpoint": "https://dynamodb.<your-region>.amazonaws.com"
        }
        ```
   * Press the "Download.csv" button, and keep this in a safe spot as well just in case
   * Note the file location of this json file (handy trick: hold shift, then right click on a file in windows, it will give you an option to copy the file path)
   * In your IDE, open the file under Online-Messaging-Backend: `src/config/aws.config.ts`.
   * Replace the value of "awsConfigPath" with the path of the file you just copied.
1. Under the list of groups, click the group you previously created, then click the Users tab.
1. Click Add Users to Group, and select the user you just created, and click "Add Users"

At this point we are finally done setting up the securtiy credentials needed to run DynamoDB

##### DynamoDB

1. On the AWS Site, under services, search for and navigate to DynamoDB.
1. At this point we have 8 tables to build. It is vital at this stage that every key and partition is is created in the 
exact same way and with the same spelling as shown, or the application will not run.
   1. Channel Table:
        * Click Create table
        * For the table name enter: "Channel"
        * For partition key enter: "channelId", leave it to be of the type string 
        * Click "Add sort key", key enter: "channelName", leave it to be of the type string
        * Click create table
   1. Messages table:
        * Click Create table
        * For the table name enter: "Messages"
        * For partition key enter: "channelId", leave it to be of the type String 
        * Click "Add sort key", key enter: "insertTime", change it to the type Number
        * Click create table
   1. Notifications table:
        * Click Create table
        * For the table name enter: "Notifications"
        * For partition key enter: "notificationId", leave it to be of the type String 
        * Click "Add sort key", key enter: "insertedTime", change it to the type Number
        * Click create table
        * Wait for the table to be created. Once it is, click on the "Indexes" tab
        * Click "Create index"
        * For partition key enter: "channelId", leave it to be of the type String
        * Click "Add sort key", key enter: "insertedTime", change it to the type Number
        * Ensure the auto generate index name is: "channelId-insertedTime-index", and leave it as that
        * Click "Create index"
        * Click "Create index" to create another index
        * For partition key enter: "username", leave it to be of the type String
        * Click "Add sort key", key enter: "insertedTime", change it to the type Number
        * Ensure the auto generate index name is: "username-insertedTime-index", and leave it as that
        * Click "Create index"
        * Click "Create index" to create another index
        * For partition key enter: "fromFriend", leave it to be of the type String
        * No sort key for this one
        * Ensure the auto generate index name is: "fromFriend-index", and leave it as that
        * Click "Create index"
   1. Profiles table:
        * For the table name enter: "Profiles"
        * For partition key enter: "username", leave it to be of the type String
        * No sort key
        * Click create table
   1. Reactions table:
        * For the table name enter: "Reactions"
        * For partition key enter: "messageId", leave it to be of the type String
        * Click "Add sort key", key enter: "insertTime", change it to the type Number
        * Click "Create table"
   1. Settings table:
        * For the table name enter: "Settings"
        * For partition key enter: "username", leave it to be of the type String
        * No sort key
        * Click create table
   1. UserChannel table:
        * For the table name enter: "UserChannel"
        * For partition key enter: "username", leave it to be of the type String
        * Click "Add sort key", key enter: "channelId", leave it to be of the type string
        * Click create table
        * Wait for the table to be created. Once it is, click on the "Indexes" tab
        * Click "Create index"
        * For partition key enter: "channelId", leave it to be of the type String
        * Click "Add sort key", key enter: "usernmae", leave it to be of the type string
        * Ensure the auto generate index name is: "channelId-username-index", and leave it as that
        * Click "Create index"
   1. Users table:
        * For the table name enter: "Users"
        * For partition key enter: "username", leave it to be of the type String
        * No sort key
        * Click create table
At this point, all of the neccisary tables have been create. Given the NoSQL nature of DynamoDB, the other remaining
fields on each table will be created Dynamically as the application creates data.

#### _Aside_

The instructions above should be used to generate the database tables at least for the first run, however, if you do
intend on running the application with a installed version of DynamoDB, here is the schema JSON for doing so (note, no
insructions on DynamoDB installation as this was not used during development):


<details>
    <summary>Click to expand</summary>
    
```
{
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
            GlobalSecondaryIndexes: [
                {
                    IndexName: "channelId-username-index",
                    KeySchema: [
                        { AttributeName: "channelId", KeyType: "HASH" },
                        { AttributeName: "username", KeyType: "RANGE" }
                    ],
                    Projection: {
                        ProjectionType: "ALL"
                    },
                    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
                }
            ],
            ProvisionedThroughput: { ReadCapacityUnits: 10, WriteCapacityUnits: 10 }
        },
        {
            TableName: `Profiles`,
            KeySchema: [
                { AttributeName: "username", KeyType: "HASH" }
            ],
            AttributeDefinitions: [
                { AttributeName: "username", AttributeType: "S" }
            ],
            ProvisionedThroughput: { ReadCapacityUnits: 10, WriteCapacityUnits: 10 }
        },
        {
            TableName: `Settings`,
            KeySchema: [
                { AttributeName: "username", KeyType: "HASH" }
            ],
            AttributeDefinitions: [
                { AttributeName: "username", AttributeType: "S" }
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
                { AttributeName: "insertedTime", AttributeType: "N" },
                { AttributeName: "channelId", AttributeType: "S" },
                { AttributeName: "username", AttributeType: "S" },
                { AttributeName: "fromFriend", AttributeType: "S" }
            ],
            GlobalSecondaryIndexes: [
                {
                    IndexName: "channelId-insertedTime-index",
                    KeySchema: [
                        { AttributeName: "channelId", KeyType: "HASH" },
                        { AttributeName: "insertedTime", KeyType: "RANGE" }
                    ],
                    Projection: {
                        ProjectionType: "ALL"
                    },
                    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
                },
                {
                    IndexName: "username-insertedTime-index",
                    KeySchema: [
                        { AttributeName: "username", KeyType: "HASH" },
                        { AttributeName: "insertedTime", KeyType: "RANGE" }
                    ],
                    Projection: {
                        ProjectionType: "ALL"
                    },
                    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
                },
                {
                    IndexName: "fromFriend-index",
                    KeySchema: [
                        { AttributeName: "fromFriend", KeyType: "HASH" }
                    ],
                    Projection: {
                        ProjectionType: "ALL"
                    },
                    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
                }
            ],
            ProvisionedThroughput: { ReadCapacityUnits: 10, WriteCapacityUnits: 10 }
        },
        {
            TableName: `Reactions`,
            KeySchema: [
                { AttributeName: "messageId", KeyType: "HASH" },
                { AttributeName: "insertTime", KeyType: "RANGE" }
            ],
            AttributeDefinitions: [
                { AttributeName: "messageId", AttributeType: "S" },
                { AttributeName: "insertTime", AttributeType: "N" }
            ],
            ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
        }
    ]
}
```
    
</details>

#### S3 Setup

S3 is used to store user profile image pictures. The set up is as follows:

1. On the AWS site, navigate to the S3 console
1. Click "Create bucket"
1. For the bucket name enter: "streamline-athletes-messaging-app"
1. Leave the region on your region
1. Uncheck "Block all public access", then check "I acknowledge that the current settings might result in this bucket and the objects within becoming public."
1. Click "Create bucket"
1. Click on the bucket you just created, then click on the "Permissions" tab, then below that click the "Bucket Policy" tab
1. Replace any text there with:
    *
    ```json
    {
        "Version": "2008-04-01",
        "Statement": [
            {
                "Sid": "AllowPublicRead",
                "Effect": "Allow",
                "Principal": {
                    "AWS": "*"
                },
                "Action": "s3:GetObject",
                "Resource": "arn:aws:s3:::streamline-athletes-messaging-app/*"
            }
        ]
    }
    ```
1. Click "Save"
1. Click on the "Overview tab", and click "Create folder"
1. Name the folder: "user-profile-images" and click save
1. Enter into the folder, and click "Upload"
1. Click add files, and navigate to where you have the project stored on your machine.
1. Find the file Online-Messaging-App/src/assests/default.png and upload it.
1. Click next, then under "Manage public permissions" click the drop down and select "Grant public read access to this objects". Click "Upload"
1. This will allow all users who have just signed up to have their profile image be a default user icon.

##### _Aside_

**Note** If you chose to name the S3 bucket something else other than streamline-athletes-messaging-app" you will have a few places to change in the code to look for this.

<details>
    <summary>Click to expand</summary>

If you named it <your-new-name-here>, you will need to update:

1. Under Online-Messaging-App
   1.  In `src/routes/profiles/Profile_Constants.ts` change: `export const PROFILE_IMAGE_S3_PREFIX =
                                                                  "https://streamline-athletes-messaging-app.s3.ca-central-1.amazonaws.com/user-profile-images/";` to: `export const PROFILE_IMAGE_S3_PREFIX =
                                                                                                                                                                              "https://<your-new-name-here>.s3.ca-central-1.amazonaws.com/user-profile-images/";`
   2. In `src/routes/userChannels/UserChannelDAO` change `const PROFILE_IMAGE_S3_PREFIX: string =
                                                              "https://streamline-athletes-messaging-app.s3.ca-central-1.amazonaws.com/user-profile-images/";` to: `const PROFILE_IMAGE_S3_PREFIX: string =
                                                                                                                                                                        "https://<your-new-name-here>.s3.ca-central-1.amazonaws.com/user-profile-images/";`
   2. In `src/config/aws-config.ts` in the definition of `AWSS3Config` replace the value of `bucket` with `<your-new-name-here>`

</details>

At this point you have finished the setup for the S3 bucket, as well as the setup for all AWS services.

### Running the application locally

At this point you should have everything in place to run the application locally. Here are the steps to do so.

1. Open the application in your IDE, and switch to the develop branch.
    * Ensure any configuration information that you may have made in a seperate branch in previous steps during AWS set up is updated to the develop branch.
1. As said in the AWS setup, ensure that in `Online-Messaging-Backend/src/config/aws.config.ts` the path to the AWS secret key file is correct, and the file is in place
1. At this point you can create run configurations for both Online-Messaging-App, and Online-Messaging-Backend, pointing your IDE to the respective `package.json` files.
1. Do a breif scan of both folder, and ensure there is no problems with dependencies. If there is simply run `npm install`
1. At this point, you can run your run configurations, running the backend first OR
    * If you prefer to run in the terminal, open two terminal windows that have access to npm and
    * In the first do, navigate to the root folder of the repository and do:
    ```json
    cd Online-Messaging-Backend
    npm run start
    ```
   Then wait for node to start up the server. You should see in the console: "server started on :8080", and if you navigate to http://localhost:8080 on your web browser, you should get "Backend is up and running"
   * In the second terminal, navigate to the root folder of the repository and do:
   ```json
    cd Online-Messaging-Backend
    npm run start
    ```
   This step may take a while the first time, as npm will have to compile the entire application from scratch, but after this it should run faster.
1. Once the application is finished and running, you can navigate to http://localhost:4200 and you should be greeted with the Login screen.

You now have successfully installed the application on your local machine. At this point it is recommended to test the
application locally a little just to ensure that everything you did with configuration and AWS is working correctly.

### Running The Application On A Server

In order to run the application on a server, we assume you have a server with a public IP address or endpoint, and Node.js and Apache installed on the machine.

1. From all of the previous steps ensure everything is working correctly and all of your configuration is in place on the develop branch.
1. Commit the develop branch with this information, and push it up if you are using a remote Git repository
1. Do `git checkout release` and then `git pull origin develop` if you are using a remote repository, or `git pull develop` if you are not.
1. Now there are several configurations that will have to be changed on this branch to move the application to a server
runnable version: 
    1. Under Online-Messaging-Backend
        1. In `src/config/app-config.ts` in the declaration of "IO_ACCEPTED_ORIGINS"
            * Change: "`http://localhost:4200 http://ec2-35-183-101-255.ca-central-1.compute.amazonaws.com:*`"
            * To: "`http://localhost:4200 http://<your-servers-public-IP-or-url>:*`"
    1. Under Online-Messaging-App
        1. In `src/app/shared/app-config.ts`, in the declaration of `APIConfig`, update all of the values. For all of them:
            * Change: "`http://ec2-35-183-101-255.ca-central-1.compute.amazonaws.com:8080/<api>/`"
            * To: "`http://<your-servers-public-IP-or-url>:8080/<api>/`"
        1. In `src/app/shared/messenger.service.ts`, on line 16
            * Change: "`private url = "http://ec2-35-183-101-255.ca-central-1.compute.amazonaws.com:8080";`"
            * To: "`private url = "http://<your-servers-public-IP-or-url>:8080";`"
        1. In `src/app/shared/notification.service.ts`, on line 28
              * Change: "`private url = "http://ec2-35-183-101-255.ca-central-1.compute.amazonaws.com:8080";`"
              * To: "`private url = "http://<your-servers-public-IP-or-url>:8080";`"
1. At this point the application is ready to be deployed. There are two ways of doing so shown below. Follow only one set:
    * If your server has any decent amount of memory (i.e. NOT a EC2-micro instance), and it has Git installed:
        1. Commit and push up your newly configured version of the release branch.
        1. Go to Github and get the clone URL
        1. On your server, in any preffered location, clone the repository.
        1. In the repository, navigate to the Online-Messaging-Backend folder and run `npm install`
        1. Then run: `npm run-script build`
        1. The new dist folder will now contain the built backend. If you prefer, move it's contents to a better location, but they can be anywhere on the server.
        1. Navigate into the dist folder, or where ever you put it's contents.
        1. Navigate to Online-Messaging-App and repeat steps d-g again with this folder
        1. Move to steps below
    * If your server does not have good memory (i.e. a EC2-micro instance), and does not have Git installed:
        1. On your local machine, open a terminal, and navigate to Online-Messaging-Backend
        1. Run `npm run-script build`
        1. Using MobaXterm's SFTP service, or equivelent program, move all the contents under `dist` to the home directory of the server (or where ever you have FTP access)
        1. Also FTP the package.json file over to a nearby location
        1. On your local machine, open a terminal, and navigate to Online-Messaging-App
        1 Run `npm run-script build`
        1. Using MobaXterm's SFTP service, or equivelent program, move all the contents under `dist/Online-Messaging-App` to the home directory of the server (or where ever you have FTP access)
        1. Move to steps below
1. At this point you should have two folders on your server, in your home directory, or somewhere equivelent, one containing the built Online-Messaging-Backend, and one for the Online-Message-App
1. We start by installing and running the Online-Messaging-Backend:
    1. cd into the directory containing package.json and run `npm install`
    1. Then cd into the directory containing the built backend files.
    1. As a test, run `node index.js`, and ensure that after is launches, you get "server started at :8080". This will make sure that the code had been configured correctly to run on this server
    1. Press ctrl+c
    1. At this point you can run whichevery program you want to "persist" the running of index.js, but pm2 was used in development
    1. Follow [these steps](https://pm2.keymetrics.io/docs/usage/quick-start/) to install pm2 on your machine
    1. Run the following:
        *
        ```bash
       pm2 start index.js
       pm2 save
       pm2 startup 
       ```
       At which point pm2 will output a long command, starting with sudo. Paste and run this command.
    The backend will now run regardless of whether you are in a ssh session on the server, and if the server shuts down, it will be started again on startup.
    1. Go to: `http://<your-server>.com:8080` on your web browser, and ensure you get "Backend is up and running"
1. Now the Online-Messaging-Backend:
    1. The frontend can be run in any way a static website can be run. It can even be run as an S3 static hosting, however Apache was used in development.
    1. Navigate to the directory containing the frontend files and run: `sudo cp -r * /var/www/html/`
    1. At this point, Apache handles serving for you, so you are done.
    1. Go to `http://<your-server>.com` and you should be greeted with the Login screen

This concludes the installation instructions. If you have done everything correctly, you should now have functioning development and production copies of the full application.

Thank you

