import jwkToBuffer from "jwk-to-pem";
import { awsCognitoConfig, UserPoolConfig } from "../config/aws-config";
import * as jwt from "jsonwebtoken";
import { Observable } from "rxjs";

const pem = jwkToBuffer(awsCognitoConfig);

const JWK_ALGORITHM = "RS256";
const BEARER_STRING_A = "Bearer ";
const BEARER_STRING_B = "Bearer";

export interface DecodedCognitoToken {
    sub: string,
    email_verified: boolean,
    iss: string,
    "cognito:username": string,
    given_name: string,
    aud: string,
    event_id: string,
    token_use: string,
    auth_time: number,
    exp: number,
    iat: number,
    family_name: string,
    email: string
}

export interface HTTPResponseAndToken {
    decodedToken: DecodedCognitoToken,
    httpResponse: {
        status: number,
        data: {
            message: string
        }
    }
}


export class JwtVerificationService {
    private static instance: JwtVerificationService;

    constructor() {
    }

    public static getInstance(): JwtVerificationService {
        if (!JwtVerificationService.instance) {
            JwtVerificationService.instance = new JwtVerificationService();
        }
        return JwtVerificationService.instance;
    }

    public verifyJWTToken(token: string): Observable<HTTPResponseAndToken> {

        return new Observable<HTTPResponseAndToken>((observer) => {

            if (token) {

                if (token.startsWith(BEARER_STRING_A) || token.startsWith(BEARER_STRING_B)) {
                    token = token.slice(7, token.length);
                }

                if (token) {

                    jwt.verify(token, pem, { algorithms: [JWK_ALGORITHM] }, (err, decodedToken: DecodedCognitoToken) => {

                        if (err) {
                            console.log("Not verified");
                            observer.error({
                                status: 401,
                                data: { message: "Token is not valid" }
                            });
                        } else {

                            if (Date.now() < decodedToken.exp * 1000) {

                                if (decodedToken.aud === UserPoolConfig.ClientId) {

                                    let expectedISS = UserPoolConfig.UserPoolURL + UserPoolConfig.UserPoolId;
                                    if (decodedToken.iss === expectedISS) {

                                        if (decodedToken.token_use === UserPoolConfig.ExpectedTokenUse) {

                                            observer.next({
                                                decodedToken: decodedToken,
                                                httpResponse: {
                                                    status: 200,
                                                    data: { message: "Token is valid" }
                                                }
                                            });
                                            observer.complete();

                                        } else {
                                            console.log("Bad token use");
                                            observer.error({
                                                status: 401,
                                                data: { message: "Auth token is invalid" }
                                            });
                                        }

                                    } else {
                                        console.log("Bad ISS");
                                        observer.error({
                                            status: 401,
                                            data: { message: "Auth token is invalid" }
                                        });
                                    }

                                } else {
                                    console.log("Bad aud");
                                    observer.error({
                                        status: 401,
                                        data: { message: "Auth token is invalid" }
                                    });
                                }

                            } else {
                                console.log("Expired token");
                                observer.error({
                                    status: 401,
                                    data: { message: "Auth token is expired" }
                                });
                            }

                        }

                    });


                }

            } else {
                console.log("Auth token is missing");
                observer.error({
                    status: 401,
                    data: { message: "Auth token is missing" }
                });
            }

        });

    }

}
