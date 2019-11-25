# COSC-499-Group-1
COSC 499 Group 1 Capstone Project - Online Messaging Inegration for StreamLine Athletics

Ensure [NodeJS](https://nodejs.org/en/) is installed on your machine in order to run locally

Once cloned, you IDE should prompt you automatically to install dependencies, however if it doesn't simply from the project root do:
```bash
cd Online-Messaging-App
npm install
cd ../Online-Messaging-Backend
npm install
cd ..
npm i @angular/cli -g --save-dev
npm i express -g  --save-dev
```

Once this is done, everything should be working correctly.
The project is divided into front (Online-Messaging-App) and back (Online-Messaging-Backend) end directories. These to are run independantly from one another, and therefore must be started seperately.

To ensure you have installed the project correctly, you can either configure your IDE with new run configurations, one for each front and back end, pointing the IDE to their respective `package.json` files, or alternatively run: `npm run start` while in the root folder of the end you want to run.
when conmplete.
For front end:
	Go to http://localhost:4200
	You should see a the login page, and the console should display no errors.
For back end:
	Go to http://localhost:8080
	You should see the message "Backend is up and running"

When running the front end, as you make changes to the code, your webbrowser will auto-reload the new changes you've made each time you save.

When running the back end, new changes will not auto-reload, so you will have to manually re-run the backend run configuration, and refresh the page on your browser

*Amazon Cognito Fix*<br>
There is/was (depending on the status of this [pull request](https://github.com/aws-amplify/amplify-js/pull/4427) on the
official AWS github) an issue where one error message (that we need to catch to provide vital error checking in the login
component) cannot be thrown due to a minor BigInteger signing issue. The fix is simple but unfortunately, until the 
pull request is merged, and the version is updated, we will not have this issue fixed. However, given that that fix is 
simple enough, a minor change can be done to the local `node_module` of `amazon-cognito-identity-js` fix this issue in
the mean time.<br>
To do this fix simply
1. Under `Online-Messaging-App` go into your local `node_modules` folder
2. Locate the sub-folder `amazon-cognito-identity-js`
3. Under this folder find the file: `src\BigInteger.js`
4. On line `222`
   1. change:
   ```javascript
   if (this.s < 0) return '-' + this.negate().toString();
   ```
   2. to:
   ```javascript
    if (this.s < 0) return '-' + this.negate().toString(b);
   ```
5. Save the file and stop and re-run the app if you started it already.
<br>**Don't re-run `npm install` or you will have to  do these steps again**
     

