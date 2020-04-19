export const PATH_GET_ALL_CHANNELS: string = "/";
export const PATH_GET_CHANNEL_BY_ID: string = "/:channelId";
export const PATH_GET_ALL_SUBSCRIBED_USERS_FOR_CHANNEL: string = "/:channelId/users";
export const PATH_GET_ALL_MESSAGES_FOR_CHANNEL: string = "/:channelId/messages/loadCount/:loadCount";
export const PATH_POST_NEW_USER_SUBSCRIPTION_TO_CHANNEL: string = "/:channelId/users";
export const PATH_POST_NEW_CHANNEL: string = "/";
export const PATH_PUT_CHANNEL: string = "/:channelId/";
export const PATH_PUT_CHANNEL_INVITE_STATUS: string = "/:channelId/inviteStatus/:inviteStatus/";
export const PATH_GET_ALL_NOTIFICATIONS_FOR_CHANNEL = "/:channelId/notifications";
export const PATH_BAN_USER = "/:channelId/users/:username/ban";
export const PATH_UNBAN_USER = "/:channelId/users/:username/unban";

export const MESSAGE_LOAD_COUNT = 50;

export const AUTH_KEY = "authorization";

export const CHANNEL_TABLE_NAME: string = "Channel";
export const CHANNEL_ID_QUERY = "channelId = :channelId";
export const CHANNEL_DESC_AND_TYPE_UPDATE_EXPRESSION = "SET channelDescription = :d, channelType = :t";
export const INVITE_STATUS_UPDATE_EXPRESSION = "SET inviteStatus = :i";
export const CHANNEL_ID_AND_NAME_CONDITION_EXPRESSION = "channelId = :id and channelName = :n";
