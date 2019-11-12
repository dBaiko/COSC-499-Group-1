import { Injectable } from '@angular/core';
import {AuthenticationDetails, CognitoUser, CognitoUserAttribute, CognitoUserPool} from 'amazon-cognito-identity-js';
import { Observable
} from "rxjs";

const poolData = {
  UserPoolId: 'ca-central-1_LYb5qiCzP', // Your user pool id here
  ClientId: '5mlgj3ilisnpvjd79ktdjg2cku' // Your client id here
};

const userPool = new CognitoUserPool(poolData);

@Injectable()
export class AuthorizationService {
  cognitoUser: any;

  constructor() { }

  register(username, password, email, firstName, lastName) {

    let dataEmail = {
      Name: 'email',
      Value: email
    };
    let attrEmail = new CognitoUserAttribute(dataEmail);

   let dataFirstName = {
      Name: 'given_name',
      Value: firstName
    };
    let attrFirstName = new CognitoUserAttribute(dataFirstName);

    let dataLastName = {
      Name: 'family_name',
      Value: lastName
    };
    let attrLastName = new CognitoUserAttribute(dataLastName);

    const attributeList = [];
    attributeList.push(attrEmail);
    attributeList.push(attrFirstName);
    attributeList.push(attrLastName);

    return Observable.create(observer => {
      userPool.signUp(username, password, attributeList, null, (err, result) => {
        if (err) {
          console.log('signUp error', err);
          observer.error(err);
        }

        this.cognitoUser = result.user;
        console.log('signUp success', result);
        observer.next(result);
        observer.complete();
      });
    });

  }

  // confirmAuthCode(code) {
  //   const user = {
  //     Username : this.cognitoUser.username,
  //     Pool : userPool
  //   };
  //   return Observable.create(observer => {
  //     const cognitoUser = new CognitoUser(user);
  //     cognitoUser.confirmRegistration(code, true, function(err, result) {
  //       if (err) {
  //         console.log(err);
  //         observer.error(err);
  //       }
  //       console.log('confirmAuthCode() success', result);
  //       observer.next(result);
  //       observer.complete();
  //     });
  //   });
  // }

  // signIn(email, password) {
  //
  //   const authenticationData = {
  //     Username : email,
  //     Password : password,
  //   };
  //   const authenticationDetails = new AuthenticationDetails(authenticationData);
  //
  //   const userData = {
  //     Username : email,
  //     Pool : userPool
  //   };
  //   const cognitoUser = new CognitoUser(userData);
  //
  //   return Observable.create(observer => {
  //
  //     cognitoUser.authenticateUser(authenticationDetails, {
  //       onSuccess(result) {
  //
  //         // console.log(result);
  //         observer.next(result);
  //         observer.complete();
  //       },
  //       onFailure(err) {
  //         console.log(err);
  //         observer.error(err);
  //       },
  //     });
  //   });
  // }
  //
  // isLoggedIn() {
  //   return userPool.getCurrentUser() != null;
  // }
  //
  // getAuthenticatedUser() {
  //   // gets the current user from the local storage
  //   return userPool.getCurrentUser();
  // }
  //
  // logOut() {
  //   this.getAuthenticatedUser().signOut();
  //   this.cognitoUser = null;
  // }
}
