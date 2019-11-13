import { Injectable } from '@angular/core';
import {AuthenticationDetails, CognitoUser, CognitoUserAttribute, CognitoUserPool} from 'amazon-cognito-identity-js';
import { Observable } from "rxjs";
import { CognitoConfig } from "../config/app-config";

const poolData = CognitoConfig;

const userPool = new CognitoUserPool(poolData);

@Injectable()
export class AuthenticationService {
  cognitoUser: any;

  constructor() { }

  public register(username, password, email, firstName, lastName) {

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

    return new Observable(observer => {
      userPool.signUp(username, password, attributeList, null, (err, result) => {
        if (err) {
          console.log('Registration Error: ', err);
          observer.error(err);
        }

        this.cognitoUser = result.user;
        console.log('Registration Success', result);
        observer.next(result);
        observer.complete();
      });
    });

  }

  confirmAuthCode(code) {
    const user = {
      Username : this.cognitoUser.username,
      Pool : userPool
    };
    return new Observable(observer => {
      const cognitoUser = new CognitoUser(user);
      cognitoUser.confirmRegistration(code, true, function(err, result) {
        if (err) {
          console.log(err);
          observer.error(err);
        }
        console.log('confirmAuthCode() success', result);
        observer.next(result);
        observer.complete();
      });
    });
  }

  login(username, password) {

    const authenticationData = {
      Username : username,
      Password : password,
    };
    const authenticationDetails = new AuthenticationDetails(authenticationData);

    const userData = {
      Username : username,
      Pool : userPool
    };
    const cognitoUser = new CognitoUser(userData);

    return new Observable(observer => {

      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess(result) {

          // console.log(result);
          observer.next(result);
          observer.complete();
        },
        onFailure(err) {
          console.log(err);
          observer.error(err);
        },
      });
    });
  }

  isLoggedIn() {
    return userPool.getCurrentUser() != null;
  }

  getAuthenticatedUser() {
    // gets the current user from the local storage
    return userPool.getCurrentUser();
  }

  logOut() {
    if(this.getAuthenticatedUser() != null) {
      this.getAuthenticatedUser().signOut();
      this.cognitoUser = null;
    }
  }
}
