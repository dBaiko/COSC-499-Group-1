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
     

