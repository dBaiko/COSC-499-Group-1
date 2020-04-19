export const IO_ACCEPTED_ORIGINS =
    "http://localhost:4200 http://ec2-35-183-101-255.ca-central-1.compute.amazonaws.com:*";

export const DEFAULT_PORT = 8080;

export const Constants = {
    ROOT_DIR: "/",
    SLASH: "/",
    EMPTY: "",
    SPACE: " ",
    PERCENT: "%",
    NULL: "null",
    PNG_FILE_FORMAT: ".png",
    HTTP_OK: 200,
    HTTP_UNAUTHORIZED: 401,
    HTTP_BAD_REQUEST: 400,
    HTTP_SERVER_ERROR: 500
};

export interface UserSocket {
    id: string;
    username: string;
}

export interface ReactionSocketObject {
    emoji: string;
    username: string;
    messageId: string;
}

export interface NotificationSocketObject {
    fromUser: UserSocket;
    toUser: UserSocket;
    notification: NotificationObject;
}

export interface UserChannelObject {
    username?: string;
    channelId: string;
    userChannelRole?: string;
    channelName: string;
    channelType: string;
    profileImage?: string;
    statusText?: string;
    selected?: boolean;
    notificationCount?: number;
}

export interface FriendTaglineUpdateEventObject {
    username: string;
    fromFriend: string;
    status: string;
}

export interface DecodedCognitoToken {
    sub: string;
    email_verified: boolean;
    iss: string;
    "cognito:username": string;
    given_name: string;
    aud: string;
    event_id: string;
    token_use: string;
    auth_time: number;
    exp: number;
    iat: number;
    family_name: string;
    email: string;
}

export interface HTTPResponseAndToken {
    decodedToken: DecodedCognitoToken;
    httpResponse: {
        status: number;
        data: {
            message: string;
        };
    };
}

export interface UserObject {
    username: string;
    email: string;
}

export interface ReactionObject {
    messageId: string;
    emoji: string;
    insertTime: number;
    username: string;
}

export interface ProfileObject {
    username: string;
    firstName: string;
    lastName: string;
    phone: string;
    bio: string;
    gender: string;
    dateOfBirth: string;
    citizenship: string;
    grade: number;
    gradYear: string;
    previousCollegiate: string;
    street: string;
    unitNumber: string;
    city: string;
    province: string;
    country: string;
    postalCode: string;
    club: string;
    injuryStatus: string;
    instagram: string;
    languages: Array<string>;
    coachFirstName: string;
    coachLastName: string;
    coachPhone: string;
    coachEmail: string;
    parentFirstName: string;
    parentLastName: string;
    parentEmail: string;
    parentPhone: string;
    budget: string;
}

export interface NotificationDBObject {
    notificationId: string;
    insertedTime: number;
    username: string;
    channelId: string;
    channelName: string;
    channelType: string;
    type: string;
    message: string;
    fromFriend: string;
}

export interface NotificationObject {
    channelId: string;
    channelName?: string;
    channelType?: string;
    message?: string;
    type: string;
    username?: string;
    notificationId: string;
    insertedTime: number;
    fromFriend?: string;
}

export interface NotificationSocketObject {
    fromUser: UserSocket;
    toUser: UserSocket;
    notification: NotificationObject;
}

export interface Message {
    channelId: string;
    username: string;
    content: string;
    messageId?: string;
    insertTime?: number;
    profileImage: string;
    deleted: string;
    channelType?: string;
}

export interface ChannelObject {
    channelId: string;
    channelName: string;
    channelType: string;
    channelDescription: string;
    inviteStatus?: string;
    numUsers?: number;
}

export interface SettingsObject {
    username: string,
    theme: string,
    explicit: string
}

export interface ChannelAndNumUsers extends ChannelObject {
    numUsers?: number;
}
