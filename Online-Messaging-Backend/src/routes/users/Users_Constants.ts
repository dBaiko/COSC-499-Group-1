import { Constants } from "../../config/app-config";

export const PATH_GET_ALL_SUBSCRIBED_CHANNELS_BY_USERNAME = "/:username/channels";
export const PATH_DELETE_USER_SUBSCRIPTION = "/:username/channels/:channelId";
export const PATH_POST_NEW_USER = Constants.ROOT_DIR;
export const PATH_GET_ALL_USERS = Constants.ROOT_DIR;
export const PATH_PUT_USER = "/:username";
export const PATH_GET_USER_BY_USERNAME = "/:username";
export const PATH_GET_ALL_NOTIFICATIONS_FOR_USER = "/:username/notifications";
export const PATH_GET_SETTINGS_INFO_FOR_USER = "/:username/settings/";
export const PATH_PUT_SETTINGS_FOR_USER = "/:username/settings/";
export const AUTH_KEY = "authorization";
export const COGNITO_USERNAME = "cognito:username";
export const DEFAULT_THEME: string = "light";

export const USERS_TABLE_NAME = "Users";
export const USERNAME_QUERY = "username = :username";
