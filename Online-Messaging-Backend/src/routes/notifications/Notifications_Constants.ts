export const PATH_POST_NEW_NOTIFICATION: string = "/";
export const PATH_DELETE_NOTIFICATION: string = "/:notificationId/insertedTime/:insertedTime";
export const PATH_GET_ALL_FRIEND_INVITES_FROM_USER: string = "/fromFriend/:fromFriend";
export const PATH_DELETE_ALL_MESSAGE_NOTIFICATIONS_FOR_USER_FOR_CHANNEL: string =
    "/channelId/:channelId/username/:username";
export const NOTIFICATION_TYPE_MESSAGE = "message";

export const AUTH_KEY = "authorization";

export const NOTIFICATIONS_TABLE_NAME = "Notifications";
export const NOTIFICATIONS_USER_INDEX = "username-insertedTime-index";
export const NOTIFICATIONS_FRIENDS_INDEX = "fromFriend-index";
export const NOTIFICATIONS_CHANNEL_INDEX = "channelId-insertedTime-index";

export const USERNAME_QUERY = "username = :username";
export const CHANNEL_ID_QUERY = "channelId = :channelId";
export const FROM_FRIEND_QUERY = "fromFriend = :fromFriend";
export const NOTIFICATION_AND_INSERT_TIME_CONDITION_EXPRESSION =
    "notificationId = :notificationId and insertedTime = :i";
