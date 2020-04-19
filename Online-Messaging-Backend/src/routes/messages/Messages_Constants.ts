export const AUTH_KEY = "authorization";
export const COGNITO_USERNAME = "cognito:username";

export const PATH_GET_ALL_MESSAGES: string = "/";
export const PATH_DELETE_MESSAGE: string = "/:messageId/:channelId/:insertTime/:username/";
export const PATH_ADMIN_DELETE_MESSAGE: string =
    "/:messageId/:channelId/:insertTime/:username/adminUsername/:adminUsername";
export const PATH_PUT_MESSAGE: string = "/:messageId/";
export const PATH_GET_MESSAGE_REACTIONS = "/:messageId/reactions";
export const PATH_POST_NEW_REACTION = "/:messageId/reaction/";
export const PATH_DELETE_EMOJI_FOR_MESSAGE = "/:messageId/reaction/emoji/:emoji/username/:username";

export const tableName: string = "Messages";
export const CHANNEL_ID_QUERY = "channelId = :channelId";
export const CHANNEL_ID_AND_INSERT_TIME_CONDITION_EXPRESSION = "channelId = :c and insertTime = :i";
export const DELETED_UPDATE_EXPRESSION = "SET deleted = :m";
export const CONTENT_UPDATE_EXPRESSION = "SET content = :c";
export const MESSAGE_ID_CONDITION_EXPRESSION = "messageId = :i";

export const TRUE_VALUE = "true";
export const ADMIN_TRUE_VALUE = "adminTrue";
