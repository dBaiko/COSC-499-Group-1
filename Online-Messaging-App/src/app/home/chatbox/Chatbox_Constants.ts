export const whitespaceRegEx: RegExp = /^\s+$/i;
export const STAR_REPLACE_REGEX: RegExp = /^\*+$/;
export const STAR_REGEX: RegExp = /\*/g;
export const NEW_LINE_REGEX: RegExp = /(?:\r\n|\r|\n)/g;
export const STAR_REPLACE_VALUE: string = "\\*";
export const MESSAGES_URI: string = "/messages/loadCount/";
export const USERS_URI: string = "/users";
export const NOTIFICATIONS_URI = "/notifications";
export const NOTIFICATION_MESSAGE: string = "You have been invited to join ";
export const MESSAGE_FORM_IDENTIFIER: string = "messageForm";
export const TEXT_AREA_IDENTIFIER: string = "textArea";
export const SCROLL_FRAME_IDENTIFIER: string = "scrollframe";
export const HIDDEN_BUTTON_IDENTIFIER: string = "hiddenButton";
export const FRIEND_IDENTIFIER: string = "friend";
export const PENDING_INVITE_IDENTIFIER: string = "pending";
export const DENIED_INVITE_IDENTIFIER: string = "denied";
export const ACCEPTED_INVITE_IDENTIFIER: string = "accepted";
export const GENERAL_NOTIFICATION: string = "general";
export const MESSAGE_INPUT_FIELD_IDENTIFIER: string = "messageInputField";
export const SCROLLABLE_IDENTIFIER: string = "scrollable";

export const DIALOG_CLASS = "dialog-class";
export const DIALOG_HEIGHT = "60%";
export const PENDING_INVITE_MESSAGE: string =
    " has not yet accepted your request and will not see these messages until they accept";
export const DENIED_INVITE_MESSAGE: string =
    " has denied your friend request. You can continue to view the message history," +
    " but you will have to leave this channel and make a new friend request to talk to them again";
export const ACCEPTED_INVITE_MESSAGE: string =
    " has left the channel. You can continue to view the message history," +
    " but you will have to leave this channel and make a new friend request to talk to them again";
export const JOINED_CHANNEL_MESSAGE: string = " has joined the channel";
export const LEFT_CHANNEL_MESSAGE: string = " has left the channel";

export const LANG_TYPES_PREFIX: string = "<span class=\"lang-type\">";
export const LANG_TYPES_SUFFIX: string = "</span><br>";
export const PRE_TAG: string = "pre";

export const DEFAULT_USER_CHANNEL_ROLE = "user";
export const LANG_TYPES_PREFIX_LENGTH: number = 24;
export const LANG_CLASS_PREFIX_LENGTH: number = 10;
export const FRIEND_CHANNEL_MAX_LENGTH = 2;
export const FRIEND_CHANNEL_FIRST_USER = 0;
export const FRIEND_CHANNEL_SECOND_USER = 1;

export const BROADCAST_REACTION_ADD_EVENT = "broadcast_reaction_add";
export const BROADCAST_REACTION_REMOVE_EVENT = "broadcast_reaction_remove";
export const BAN_BROADCAST_EVENT = "ban_broadcast";
export const USER_SUBBED_CHANNEL_EVENT = "newUserSubbedChannel_broadcast";
export const USER_LEFT_CHANNEL_EVENT = "newUserLeftChannel_broadcast";
export const FRIEND_TAGLINE_UPDATE_EVENT = "friendTaglineUpdateEvent_broadcast";
export const FRIEND_TAGLINE_UPDATE_ACCEPTED = "accepted";
export const FRIEND_TAGLINE_UPDATE_DENIED = "denied";

export const BREAKPOINT_OBSERVER_KEY = "(max-width: 450px)";

export const MENTION_EVERYONE_IDENTIFIER = "everyone";

export const NEWLINE = "\n";

export const ARROW_UP = 38;
export const ARROW_DOWN = 40;
export const ENTER_KEY = 13;
export const SPACE_KEY = 32;
export const SHIFT_KEY = 16;
export const TWO_KEY = 50;
export const AT_IDENTIFIER = "@";

export const HIGHLIGHTS_CLASS = "highlights";

export const NEWLINE_REGEX: RegExp = /\n$/g;
export const DOUBLE_NEWLINE = "\n\n";
export const MENTION_REGEX: RegExp = /(@[a-zA-Z]+)/g;
export const CHECK_REGEX: RegExp = /`/g;
export const CHECK_TEXT = "`";
export const MARK_REGEX: RegExp = /<mark style='background-color: var(--primary-color)'>/g;
export const MARKUP_LENGTH = 40;
export const MARK_TEXT_PREFIX = "<mark style='background-color: var(--primary-color)'>";
export const MARK_TEXT_SUFFIX = "</mark>";

export const BACKDROP_ID = "backdrop";
export const MESSAGE_INPUT_ID = "messageInputField";

export const ADMIN_USERNAME_URI = "/adminUsername/";
export const ADMIN_TRUE_VALUE = "adminTrue";
export const ADMIN_REMOVE_MESSAGE_A = "The admin ";
export const ADMIN_REMOVE_MESSAGE_B = " has removed your message on the channel ";

export const TRUE_VALUE = "true";

export const CHANNEL_DESC_IDENTIFIER = "channelDescription";

export const MESSAGE_CONTENT_IDENTIFIER = "content";

export const ADMIN_IDENTIFIER = "admin";

export const CONTENT_OPENED_CLASS = "contentOpened";
export const SIDEBAR_IDENTIFIER = "sidebar";
export const SIDEBAR_CLOSED_CLASS = "sidebarClosed";
export const INFO_IDENTIFIER = "info";
export const BACKGROUND_DARKER_CLASS = "backgroundDarker";

export const FRIEND_CHANNEL_TYPE = "friend";
export const DIRECT_MESSAGES_MESSAGE = " has mentioned you in your direct messages";
export const CHANNEL_MESSAGE = " has mentioned you on ";

export const ADMIN_REMOVE_MESSAGE = " has been removed from the channel by the admin";
export const ADMIN_BAN_MESSAGE = " has been unbanned from the channel by the admin";

export const BANNED_IDENTIFIER = "banned";

export const PUBLIC = "public";
export const PRIVATE = "private";
export const FRIEND = "friend";

export const REACTIONS_URI = "/reactions";

export const SCROLL_UP_PEEK_PREVIEW_AMOUNT = 130;

export const USER_URI = "/users/";
export const BAN_URI = "/ban";
export const UNBAN_URI = "/unban";

export const BAN_NOTIFICATION_MESSAGE_A = "You have been banned from the channel ";
export const UNBAN_NOTIFICATION_MESSAGE_A = "You have been unbanned from the channel ";
export const BAN_NOTIFICATION_MESSAGE_B = " by the admin.";
