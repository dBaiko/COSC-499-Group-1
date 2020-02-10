import { AuthenticationDetails, CognitoUser, CognitoUserPool } from "amazon-cognito-identity-js";
import { Observable } from "rxjs";
import { UserPoolConfig } from "./../../config/aws-config";
import Global = NodeJS.Global;

export interface GlobalWithCognitoFix extends Global {
    fetch: any
}

declare const global: GlobalWithCognitoFix;
global.fetch = require("node-fetch");

const userPool: CognitoUserPool = new CognitoUserPool(UserPoolConfig);

export class CognitoDAO {

    constructor() {
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
                    observer.next(result.getIdToken().getJwtToken());
                    observer.complete();
                },
                onFailure(err) {
                    console.log(err);
                    observer.error(err);
                }
            });
        });
    }
}
