import jwkToBuffer from "jwk-to-pem";
import { awsCognitoConfig, UserPoolConfig } from "../config/aws-config";
import * as jwt from "jsonwebtoken";
import { Observable, Subscriber } from "rxjs";
import { Constants, DecodedCognitoToken, HTTPResponseAndToken } from "../config/app-config";

const pem = jwkToBuffer(awsCognitoConfig);

const JWK_ALGORITHM = "RS256";
const BEARER_STRING_A = "Bearer ";
const BEARER_STRING_B = "Bearer";

const MILLISECOND_CONVERSION_FACTOR = 1000;
const BEARER_TOKEN_START_INDEX = 7;

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
        return new Observable<HTTPResponseAndToken>((observer: Subscriber<HTTPResponseAndToken>) => {
            if (token) {
                if (token.startsWith(BEARER_STRING_A) || token.startsWith(BEARER_STRING_B)) {
                    token = token.slice(BEARER_TOKEN_START_INDEX, token.length);
                }

                if (token) {
                    jwt.verify(
                        token,
                        pem,
                        { algorithms: [JWK_ALGORITHM] },
                        (err, decodedToken: DecodedCognitoToken) => {
                            if (err) {
                                observer.error({
                                    status: Constants.HTTP_UNAUTHORIZED,
                                    data: { message: "Token is not valid" }
                                });
                            } else {
                                if (Date.now() < decodedToken.exp * MILLISECOND_CONVERSION_FACTOR) {
                                    if (decodedToken.aud === UserPoolConfig.ClientId) {
                                        let expectedISS = UserPoolConfig.UserPoolURL + UserPoolConfig.UserPoolId;
                                        if (decodedToken.iss === expectedISS) {
                                            if (decodedToken.token_use === UserPoolConfig.ExpectedTokenUse) {
                                                observer.next({
                                                    decodedToken: decodedToken,
                                                    httpResponse: {
                                                        status: Constants.HTTP_OK,
                                                        data: { message: "Token is valid" }
                                                    }
                                                });
                                                observer.complete();
                                            } else {
                                                observer.error({
                                                    status: Constants.HTTP_UNAUTHORIZED,
                                                    data: { message: "Auth token is invalid" }
                                                });
                                            }
                                        } else {
                                            observer.error({
                                                status: Constants.HTTP_UNAUTHORIZED,
                                                data: { message: "Auth token is invalid" }
                                            });
                                        }
                                    } else {
                                        observer.error({
                                            status: Constants.HTTP_UNAUTHORIZED,
                                            data: { message: "Auth token is invalid" }
                                        });
                                    }
                                } else {
                                    observer.error({
                                        status: Constants.HTTP_UNAUTHORIZED,
                                        data: { message: "Auth token is expired" }
                                    });
                                }
                            }
                        }
                    );
                }
            } else {
                observer.error({
                    status: Constants.HTTP_UNAUTHORIZED,
                    data: { message: "Auth token is missing" }
                });
            }
        });
    }
}
