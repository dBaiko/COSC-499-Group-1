# Streamline Athletes - Messaging Application

#### _UBCO COSC 499 Capston Project 2020_

## Github repository
The github repository can be found [here](https://github.com/dBaiko/COSC-499-Group-1)

## Table of Contents
1. [Intro](#intro)
1. [Repository Overview](#repository-overview)
   1. [Folders](#folders)
      1. [Online-Messaging-App](#online-messaging-app)
      1. [Online-Messageing-Backend](#online-messageing-backend)
   1. [Branches](#branches)
   1. [License](#license)
1. [Installation Guide](#installation-guide)
   1. [AWS Setup](#aws-setup)

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

