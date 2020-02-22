import { Injectable } from "@angular/core";
import {
    AuthenticationDetails,
    CognitoIdToken,
    CognitoUser,
    CognitoUserAttribute,
    CognitoUserPool,
    CognitoUserSession
} from "amazon-cognito-identity-js";
import { Observable } from "rxjs";
import { CognitoConfig } from "./app-config";

const userPool: CognitoUserPool = new CognitoUserPool(CognitoConfig);
const EMAIL: string = "email";
const GIVEN_NAME: string = "given_name";
const FAMILY_NAME: string = "family_name";

@Injectable()
export class AuthenticationService {
    cognitoUser: CognitoUser;

    constructor() {}

    public register(
        username: string,
        password: string,
        email: string,
        firstName: string,
        lastName: string
    ): Observable<Object> {
        let dataEmail = {
            Name: EMAIL,
            Value: email
        };
        let attrEmail = new CognitoUserAttribute(dataEmail);

        let dataFirstName = {
            Name: GIVEN_NAME,
            Value: firstName
        };
        let attrFirstName = new CognitoUserAttribute(dataFirstName);

        let dataLastName = {
            Name: FAMILY_NAME,
            Value: lastName
        };
        let attrLastName = new CognitoUserAttribute(dataLastName);

        const attributeList = [];
        attributeList.push(attrEmail);
        attributeList.push(attrFirstName);
        attributeList.push(attrLastName);

        return new Observable<Object>((observer) => {
            userPool.signUp(username, password, attributeList, null, (err, result) => {
                if (err) {
                    console.log("Registration Error");
                    observer.error(err);
                } else {
                    this.cognitoUser = result.user;
                    console.log("Registration Success");
                    observer.next(result);
                    observer.complete();
                }
            });
        });
    }

    login(username: string, password: string): Observable<Object> {
        const authenticationData = {
            Username: username,
            Password: password
        };
        const authenticationDetails = new AuthenticationDetails(authenticationData);

        const userData = {
            Username: username,
            Pool: userPool
        };
        const cognitoUser = new CognitoUser(userData);

        return new Observable<Object>((observer) => {
            cognitoUser.authenticateUser(authenticationDetails, {
                onSuccess(result) {
                    observer.next(result);
                    observer.complete();
                },
                onFailure(err) {
                    observer.error(err);
                }
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

    getCurrentSessionId(): Observable<CognitoIdToken> {
        return new Observable<CognitoIdToken>((observer) => {
            userPool.getCurrentUser().getSession((error: Error, session: CognitoUserSession) => {
                if (error) {
                    console.log(error);
                    observer.error(error);
                }

                observer.next(session.getIdToken());
                observer.complete();
            });
        });
    }
}
