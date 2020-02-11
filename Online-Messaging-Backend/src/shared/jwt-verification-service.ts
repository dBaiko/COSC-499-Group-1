import jwkToBuffer from "jwk-to-pem";
import { awsCognitoConfig } from "../config/aws-config";

const pem = jwkToBuffer(awsCognitoConfig);

const JWK_ALGORITHM = "RS256";
const BEARER_STRING_A = "Bearer ";
const BEARER_STRING_B = "Bearer";

interface decodedCognitoToken {
    sub: string,
    email_verified: boolean,
    iss: string,
    cognito: { username: string },
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

    public static verifyJWTToken(token: string) {

        if (token) {

            if (token.startsWith(BEARER_STRING_A) || token.startsWith(BEARER_STRING_B)) {
                token = token.slice(7, token.length);
            }

            if (token) {

            }

        } else {
            console.log("Auth token is missing");
            console.log();
            console.log();
        }

    }

}
