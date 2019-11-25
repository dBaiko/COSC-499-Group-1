import {Injectable} from '@angular/core';
import {AuthenticationDetails, CognitoUser, CognitoUserAttribute, CognitoUserPool} from 'amazon-cognito-identity-js';
import {Observable} from "rxjs";
import {CognitoConfig} from "./app-config";

const userPool = new CognitoUserPool(CognitoConfig);

@Injectable()
export class AuthenticationService {
  cognitoUser: any;
  private EMAIL = 'email';
  private GIVEN_NAME = 'given_name';
  private FAMILY_NAME = 'family_name';

  constructor() {
  }

  public register(username: string, password: string, email: string, firstName: string, lastName: string): Observable<Object> {

    let dataEmail = {
      Name: this.EMAIL,
      Value: email
    };
    let attrEmail = new CognitoUserAttribute(dataEmail);

    let dataFirstName = {
      Name: this.GIVEN_NAME,
      Value: firstName
    };
    let attrFirstName = new CognitoUserAttribute(dataFirstName);

    let dataLastName = {
      Name: this.FAMILY_NAME,
      Value: lastName
    };
    let attrLastName = new CognitoUserAttribute(dataLastName);

    const attributeList = [];
    attributeList.push(attrEmail);
    attributeList.push(attrFirstName);
    attributeList.push(attrLastName);

    return new Observable<Object>(observer => {
      userPool.signUp(username, password, attributeList, null, (err, result) => {
        if (err) {
          console.log('Registration Error');
          observer.error(err);
        } else {
          this.cognitoUser = result.user;
          console.log('Registration Success');
          observer.next(result);
          observer.complete();
        }

      });
    });

  }

  login(username: string, password: string): Observable<Object> {

    const authenticationData = {
      Username: username,
      Password: password,
    };
    const authenticationDetails = new AuthenticationDetails(authenticationData);

    const userData = {
      Username: username,
      Pool: userPool
    };
    const cognitoUser = new CognitoUser(userData);

    return new Observable<Object>(observer => {

      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess(result) {

          observer.next(result);
          observer.complete();
        },
        onFailure(err) {
          observer.error(err);
        },
      });
    });
  }

  isLoggedIn(): boolean {
    return userPool.getCurrentUser() != null;
  }

  getAuthenticatedUser(): CognitoUser {
    // gets the current user from the local storage
    return userPool.getCurrentUser();
  }

  logOut(): void {
    if (this.getAuthenticatedUser() != null) {
      this.getAuthenticatedUser().signOut();
      this.cognitoUser = null;
    }
  }
}
