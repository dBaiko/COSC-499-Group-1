import { HttpHeaders } from "@angular/common/http";

export const CognitoConfig = {
    UserPoolId: "ca-central-1_6ickHVand",
    ClientId: "2n7od4b3prkjdc9trthuf3d92q"
};

export const APIConfig = {
    usersAPI: "http://localhost:8080/users/",
    messagesAPI: "http://localhost:8080/messages/",
    channelsAPI: "http://localhost:8080/channels/",
    profilesAPI: "http://localhost:8080/profiles/",
    notificationsAPI: "http://localhost:8080/notifications/"
};

export const Constants = {
    LOGIN_ROUTE: "/login",
    REGISTER_ROUTE: "/register",
    HOME_ROUTE: "/",
    SLASH: "/",
    USERNAME: "username",
    PASSWORD: "password",
    EMPTY: "",
    SPACE: " ",
    PNG: "png",
    JPG: "jpg",
    JPEG: "jpeg",
    DOT: ".",
    USERS_PATH: "/users",
    CHANNELS_PATH: "/channels",
    HTTP_OPTIONS: {
        headers: new HttpHeaders({
            "Content-Type": "application/json"
        })
    },
    DASH: "-",
    QUESTION_MARK: "?",
    FILE: "file",
    SRC: "src",
    PERCENT: "%"
};

export const VALIDATION_MESSAGES = {
    username: [
        { type: "required", message: "Username is required" },
        {
            type: "alreadyTaken",
            message: "Your username has already been taken"
        },
        {
            type: "pattern",
            message: "Username must not contain whitespace"
        },
        {
            type: "maxlength",
            message: "Username cannot be more than 30 characters"
        },
        {
            type: "invalidLogin",
            message: "Username or password is incorrect, please try again."
        },
        {
            type: "badWord",
            message: "Username cannot contain swears"
        }
    ],
    email: [
        { type: "required", message: "Email is required" },
        { type: "email", message: "Invalid email" }
    ],
    password: [
        { type: "required", message: "Password is required" },
        {
            type: "minlength",
            message: "Password must be at least 8 characters long"
        }
    ],
    confirmPassword: [
        { type: "required", message: "Please confirm your password" },
        { type: "misMatch", message: "Passwords do not match" }
    ],
    oldPassword: [{ type: "required", message: "Old password is required" }],
    firstName: [
        { type: "required", message: "First name is required" },
        {
            type: "pattern",
            message: "First name must not contain whitespace"
        },
        {
            type: "maxlength",
            message: "First name cannot be more than 30 characters"
        },
        {
            type: "badWord",
            message: "First name cannot contain swears"
        }
    ],
    lastName: [
        { type: "required", message: "Last Name is required" },
        {
            type: "pattern",
            message: "Last Name must not contain whitespace"
        },
        {
            type: "maxlength",
            message: "Last name cannot be more than 30 characters"
        },
        {
            type: "badWord",
            message: "Last name cannot contain swears"
        }
    ],
    channelName: [
        { type: "required", message: "Channel name is required" },
        {
            type: "maxlength",
            message: "Channel name cannot be more than 30 characters"
        },
        {
            type: "badWord",
            message: "Channel name cannot contain swears"
        }
    ],

    phone: [
        {
            type: "NaN",
            message: "Phone number must only contain numbers"
        },
        {
            type: "maxlength",
            message: "Phone number cannot be more than 15 characters"
        }
    ],

    bio: [
        {
            type: "maxlength",
            message: "Bio cannot be more than 150 characters"
        },
        {
            type: "badWord",
            message: "Bio cannot contain swears"
        }
    ],

    channelType: [{ type: "required", message: "Channel type is required" }],
    profileImageName: [{ type: "badFileType", message: "Image file type must be png or jpg" }],
    profileImageSize: [{ type: "badFileSize", message: "Image file size must be less than 1Mb" }],
    channelDescription: [{ type: "required", message: "Channel Description is required" }]
};

export const SANITIZE_CONFIG = {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: "escape"
};

export interface UserObject {
    username: string;
    email: string;
}

export interface InviteChannelObject {
    channelId: string;
    channelName: string;
    channelType: string;
    channelDescription: string;
    inviteStatus: string;
}

export interface MessageObject {
    channelId: string;
    insertTime: number;
    content: string;
    messageId: string;
    profileImage: string;
    username: string;
    deleted: string;
    editing: boolean;
    reactions?: Array<ReactionObject>;
    addingEmoji?: boolean;
}

export interface newChannelResponse {
    status: number;
    data: {
        message: string;
        newChannel: ChannelObject;
    };
}

export interface ChannelAndFirstUser {
    channelName: string;
    channelType: string;
    channelDescription: string;
    firstUsername: string;
    firstUserChannelRole: string;
    profileImage: string;
    inviteStatus: string;
}

export interface UserSocket {
    id: string;
    username: string;
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

export interface UserChannelObjectWithNotficationCount extends UserChannelObject {
}

export interface ChannelObject {
    channelId: string;
    channelName: string;
    channelType: string;
    channelDescription: string;
    selected?: boolean;
    filtered?: boolean;
}

export interface InviteChannelObject {
    channelId: string;
    channelName: string;
    channelType: string;
    inviteStatus: string;
}

export interface ChannelIdAndType {
    channelId: string;
    type: string;
}

export interface NotificationSocketObject {
    fromUser: UserSocket;
    toUser: UserSocket;
    notification: NotificationObject;
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

export interface UserProfileObject {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    profileImage: string;
    statusText: string;
    phone?: string;
    bio?: string;
    gender?: string;
    dateOfBirth?: string;
    citizenship?: string;
    grade?: number;
    gradYear?: string;
    previousCollegiate?: string;
    street?: string;
    unitNumber?: string;
    city?: string;
    province?: string;
    country?: string;
    postalCode?: string;
    club?: string;
    injuryStatus?: string;
    instagram?: string;
    languages?: Array<string>;
    coachFirstName?: string;
    coachLastName?: string;
    coachPhone?: string;
    coachEmail?: string;
    parentFirstName?: string;
    parentLastName?: string;
    parentPhone?: string;
    parentEmail?: string;
    budget?: string;
}

export interface ChannelIdAndType {
    channelId: string;
    type: string;
}

export interface ChannelAndNumUsers extends ChannelObject {
    numUsers?: number;
}

export interface NewUsersSubbedChannelObject {
    channelId: string;
    username: string;
    joined: boolean;
}

export interface HttpResponse {
    status: number;
    data: {
        message: string;
        newChannel: ChannelObject;
    };
}

export interface ProfileObject {
    username: string;
    firstName: string;
    lastName: string;
    email?: string;
    profileImage: string;
    statusText: string;
    phone?: string;
    bio?: string;
    gender?: string;
    dateOfBirth?: string;
    citizenship?: string;
    grade?: number;
    gradYear?: string;
    previousCollegiate?: string;
    street?: string;
    unitNumber?: string;
    city?: string;
    province?: string;
    country?: string;
    postalCode?: string;
    club?: string;
    injuryStatus?: string;
    instagram?: string;
    languages?: Array<string>;
    coachFirstName?: string;
    coachLastName?: string;
    coachPhone?: string;
    coachEmail?: string;
    parentFirstName?: string;
    parentLastName?: string;
    parentPhone?: string;
    parentEmail?: string;
    budget?: string;
}

export interface SettingsObject {
    username: string;
    theme: string;
    explicit: boolean;
}

export interface FriendTaglineUpdateEventObject {
    username: string;
    fromFriend: string;
    status: string;
}

export interface ProfileImageUpdateObject {
    profileImage: string;
}

export const EmojiList = [
    "😀",
    "😃",
    "😄",
    "😁",
    "😆",
    "👍",
    "👎",
    "😅",
    "🤣",
    "😂",
    "🙂",
    "🙃",
    "😉",
    "😊",
    "😇",
    "🥰",
    "😍",
    "🤩",
    "😘",
    "😗",
    "😚",
    "😙",
    "😋",
    "😛",
    "😜",
    "🤪",
    "😝",
    "🤑",
    "🤗",
    "🤭",
    "🤫",
    "🤔",
    "🤐",
    "🤨",
    "😐",
    "😑",
    "😶",
    "😏",
    "😒",
    "🙄",
    "😬",
    "🤥",
    "😌",
    "😔",
    "😪",
    "🤤",
    "😴",
    "😷",
    "🤒",
    "🤕",
    "🤢",
    "🤮",
    "🤧",
    "🥵",
    "🥶",
    "🥴",
    "😵",
    "🤯",
    "🤠",
    "🥳",
    "😎",
    "🤓",
    "🧐",
    "😕",
    "😟",
    "🙁",
    "😮",
    "😯",
    "😲",
    "😳",
    "🥺",
    "😦",
    "😧",
    "😨",
    "😰",
    "😥",
    "😢",
    "😭",
    "😱",
    "😖",
    "😣",
    "😞",
    "😓",
    "😩",
    "😫",
    "😤",
    "😡",
    "😠",
    "🤬",
    "😈",
    "👿",
    "💀",
    "💩",
    "🤡",
    "👹",
    "👺",
    "👻",
    "👽",
    "👾",
    "🤖",
    "😺",
    "😸",
    "😹",
    "😻",
    "😼",
    "😽",
    "🙀",
    "😿",
    "😾",
    "🙈",
    "🙉",
    "🙊",
    "💋",
    "💌",
    "💘",
    "💝",
    "💖",
    "💗",
    "💓",
    "💞",
    "💕",
    "💟",
    "💔",
    "🧡",
    "💛",
    "💚",
    "💙",
    "💜",
    "🖤",
    "💯",
    "💢",
    "💥",
    "💫",
    "💦",
    "💨",
    "🕳",
    "💣",
    "💬",
    "🗯",
    "💭",
    "💤",
    "👋",
    "🤚",
    "🖐",
    "✋",
    "🖖",
    "👌",
    "🤞",
    "🤟",
    "🤘",
    "🤙",
    "👈",
    "👉",
    "👆",
    "🖕",
    "👇",
    "✊",
    "👊",
    "🤛",
    "🤜",
    "👏",
    "🙌",
    "👐",
    "🤲",
    "🤝",
    "🙏",
    "💅",
    "🤳",
    "💪",
    "🦵",
    "🦶",
    "👂",
    "👃",
    "🧠",
    "🦷",
    "🦴",
    "👀",
    "👁",
    "👅",
    "👄",
    "👶",
    "🧒",
    "👦",
    "👧",
    "🧑",
    "👱",
    "👨",
    "🧔",
    "👩",
    "👱‍♀️",
    "👱‍♂️",
    "🧓",
    "👴",
    "👵",
    "🙍",
    "🙍‍♂️",
    "🙍‍♀️",
    "🙎",
    "🙎‍♂️",
    "🙎‍♀️",
    "🙅",
    "🙅‍♂️",
    "🙅‍♀️",
    "🙆",
    "🙆‍♂️",
    "🙆‍♀️",
    "💁",
    "💁‍♂️",
    "💁‍♀️",
    "🙋‍♂️",
    "🙋‍♀️",
    "🙇",
    "🙇‍♂️",
    "🙇‍♀️",
    "🤦",
    "🤦‍♂️",
    "🤦‍♀️",
    "🤷",
    "🤷‍♂️",
    "🤷‍♀️",
    "🧑‍⚕️",
    "👨‍⚕️",
    "👩‍⚕️",
    "🧑‍⚖️",
    "👨‍⚖️",
    "👩‍⚖️",
    "🧑‍✈️",
    "👨‍✈️",
    "👩‍✈️",
    "👮",
    "👮‍♂️",
    "👮‍♀️👮‍♀️",
    "🕵",
    "🕵️‍♂️",
    "🕵️‍♀️",
    "💂",
    "💂‍♂️",
    "💂‍♀️",
    "👷",
    "👷‍♂️",
    "👷‍♀️",
    "🤴",
    "👸",
    "👳",
    "👳‍♂️",
    "👳‍♀️",
    "👲",
    "🧕",
    "🤵",
    "🤵‍♂️",
    "🤵‍♀️",
    "👰",
    "👰‍♂️",
    "👰‍♀️",
    "🤰",
    "🤱",
    "👩‍🍼",
    "👨‍🍼",
    "🧑‍🍼",
    "👼",
    "🎅",
    "🤶",
    "🧑‍🎄",
    "🦸",
    "🦸‍♂️",
    "🦸‍♀️",
    "🦹",
    "🦹‍♂️",
    "🦹‍♀️",
    "🧙",
    "🧙‍♂️",
    "🧙‍♀️",
    "🧚",
    "🧚‍♂️",
    "🧚‍♀️",
    "🧛",
    "🧛‍♂️",
    "🧛‍♀️",
    "🧜",
    "🧜‍♂️",
    "🧜‍♀️",
    "🧝",
    "🧝‍♂️",
    "🧝‍♀️",
    "🧞",
    "🧞‍♂️",
    "🧞‍♀️",
    "🧟",
    "🧟‍♂️",
    "🧟‍♀️",
    "💆",
    "💆‍♂️",
    "💆‍♀️",
    "💇",
    "💇‍♂️",
    "💇‍♀️",
    "🚶",
    "🚶‍♂️",
    "🚶‍♀️",
    "🏃",
    "🏃‍♂️",
    "🏃‍♀️",
    "💃",
    "🕺",
    "🕴",
    "👯",
    "👯‍♂️",
    "👯‍♀️",
    "🧖",
    "🧖‍♂️",
    "🧖‍♀️",
    "🧗",
    "🧗‍♂️",
    "🧗‍♀️",
    "🤺",
    "🏇",
    "⛷",
    "🏂",
    "🏌",
    "🏌️‍♂️",
    "🏌️‍♀️",
    "🏄",
    "🏄‍♂️",
    "🏄‍♀️",
    "🚣",
    "🚣‍♂️",
    "🚣‍♀️",
    "🏊",
    "🏊‍♂️",
    "🏊‍♀️",
    "⛹",
    "⛹️‍♂️",
    "⛹️‍♀️",
    "🏋",
    "🏋️‍♂️",
    "🏋️‍♀️",
    "🚴",
    "🚴‍♂️",
    "🚴‍♀️",
    "🚵",
    "🚵‍♂️",
    "🚵‍♀️",
    "🤸",
    "🤸‍♂️",
    "🤸‍♀️",
    "🤼",
    "🤼‍♂️",
    "🤼‍♀️",
    "🤽",
    "🤽‍♂️",
    "🤽‍♀️",
    "🤾",
    "🤾‍♂️",
    "🤾‍♀️",
    "🤹",
    "🤹‍♂️",
    "🤹‍♀️",
    "🧘",
    "🧘‍♂️",
    "🧘‍♀️",
    "🛀",
    "🛌",
    "🧑‍🤝‍🧑",
    "👭",
    "👫",
    "👬",
    "💏",
    "👩‍❤️‍💋‍👨",
    "👨‍❤️‍💋‍👨",
    "👩‍❤️‍💋‍👩",
    "💑",
    "👩‍❤️‍👨",
    "👨‍❤️‍👨",
    "👩‍❤️‍👩",
    "👪",
    "👨‍👩‍👦",
    "👨‍👩‍👧",
    "👨‍👩‍👧‍👦",
    "👨‍👩‍👦‍👦",
    "👨‍👩‍👧‍👧",
    "👨‍👨‍👦",
    "👨‍👨‍👧",
    "👨‍👨‍👧‍👦",
    "👨‍👨‍👦‍👦",
    "👨‍👨‍👧‍👧",
    "👩‍👩‍👦",
    "👩‍👩‍👧",
    "👩‍👩‍👧‍👦",
    "👩‍👩‍👦‍👦",
    "👩‍👩‍👧‍👧",
    "👨‍👦‍👦",
    "👨‍👧‍👦",
    "👨‍👧‍👧",
    "👩‍👦‍👦",
    "👩‍👧‍👦",
    "👩‍👧‍👧",
    "🗣",
    "👤",
    "👥",
    "👣",
    "🦰",
    "🦱",
    "🦳",
    "🦲",
    "🐵",
    "🐒",
    "🦍",
    "🐶",
    "🐕",
    "🐩",
    "🐺",
    "🦊",
    "🦝",
    "🐱",
    "🐈",
    "🐈‍⬛",
    "🦁",
    "🐯",
    "🐅",
    "🐆",
    "🐴",
    "🐎",
    "🦄",
    "🦓",
    "🦌",
    "🐮",
    "🐂",
    "🐃",
    "🐄",
    "🐷",
    "🐖",
    "🐗",
    "🐽",
    "🐏",
    "🐑",
    "🐐",
    "🐪",
    "🐫",
    "🦙",
    "🦒",
    "🐘",
    "🦣",
    "🦏",
    "🦛",
    "🐭",
    "🐁",
    "🐀",
    "🐹",
    "🐰",
    "🐇",
    "🐿",
    "🦔",
    "🦇",
    "🐻",
    "🐻‍❄️",
    "🐨",
    "🐼",
    "🦘",
    "🦡",
    "🐾",
    "🦃",
    "🐔",
    "🐓",
    "🐣",
    "🐤",
    "🐥",
    "🐦",
    "🐧",
    "🕊",
    "🦅",
    "🦆",
    "🦢",
    "🦉",
    "🦚",
    "🦜",
    "🐸",
    "🐊",
    "🐢",
    "🦎",
    "🐍",
    "🐲",
    "🐉",
    "🦕",
    "🦖",
    "🐳",
    "🐋",
    "🐬",
    "🐟",
    "🐠",
    "🐡",
    "🦈",
    "🐙",
    "🐚",
    "🐌",
    "🦋",
    "🐛",
    "🐜",
    "🐝",
    "🐞",
    "🦗",
    "🕷",
    "🕸",
    "🦂",
    "🦟",
    "🦠",
    "💐",
    "🌸",
    "💮",
    "🏵",
    "🌹",
    "🥀",
    "🌺",
    "🌻",
    "🌼",
    "🌷",
    "🌱",
    "🪴",
    "🌲",
    "🌳",
    "🌴",
    "🌵",
    "🌾",
    "🌿",
    "☘",
    "🍀",
    "🍁",
    "🍂",
    "🍃",
    "🍇",
    "🍈",
    "🍉",
    "🍊",
    "🍋",
    "🍌",
    "🍍",
    "🥭",
    "🍎",
    "🍏",
    "🍐",
    "🍑",
    "🍒",
    "🍓",
    "🥝",
    "🍅",
    "🥥",
    "🥑",
    "🍆",
    "🥔",
    "🥕",
    "🌽",
    "🌶",
    "🥒",
    "🥬",
    "🥦",
    "🍄",
    "🥜",
    "🌰",
    "🍞",
    "🥐",
    "🥖",
    "🥨",
    "🥯",
    "🥞",
    "🧀",
    "🍖",
    "🍗",
    "🥩",
    "🥓",
    "🍔",
    "🍟",
    "🍕",
    "🌭",
    "🥪",
    "🌮",
    "🌯",
    "🥙",
    "🥚",
    "🍳",
    "🥘",
    "🍲",
    "🥣",
    "🥗",
    "🍿",
    "🧂",
    "🥫",
    "🍱",
    "🍘",
    "🍙",
    "🍚",
    "🍛",
    "🍜",
    "🍝",
    "🍠",
    "🍢",
    "🍣",
    "🍤",
    "🍥",
    "🥮",
    "🍡",
    "🥟",
    "🥠",
    "🥡",
    "🦀",
    "🦞",
    "🦐",
    "🦑",
    "🍦",
    "🍧",
    "🍨",
    "🍩",
    "🍪",
    "🎂",
    "🍰",
    "🧁",
    "🥧",
    "🍫",
    "🍬",
    "🍭",
    "🍮",
    "🍯",
    "🍼",
    "🥛",
    "☕",
    "🫖",
    "🍵",
    "🍶",
    "🍾",
    "🍷",
    "🍸",
    "🍹",
    "🍺",
    "🍻",
    "🥂",
    "🥃",
    "🥤",
    "🥢",
    "🍽",
    "🍴",
    "🥄",
    "🔪",
    "🏺",
    "🌍",
    "🌎",
    "🌏",
    "🌐",
    "🗺",
    "🗾",
    "🧭",
    "🏔",
    "⛰",
    "🌋",
    "🗻",
    "🏕",
    "🏖",
    "🏜",
    "🏝",
    "🏞",
    "🏟",
    "🏛",
    "🏗",
    "🧱",
    "🏘",
    "🏚",
    "🏠",
    "🏡",
    "🏢",
    "🏣",
    "🏤",
    "🏥",
    "🏦",
    "🏨",
    "🏩",
    "🏪",
    "🏫",
    "🏬",
    "🏭",
    "🏯",
    "🏰",
    "💒",
    "🗼",
    "🗽",
    "⛪",
    "🕌",
    "🕍",
    "⛩",
    "🕋",
    "⛲",
    "⛺",
    "🌁",
    "🌃",
    "🏙",
    "🌄",
    "🌅",
    "🌆",
    "🌇",
    "🌉",
    "♨",
    "🎠",
    "🎡",
    "🎢",
    "💈",
    "🎪",
    "🚂",
    "🚃",
    "🚄",
    "🚅",
    "🚆",
    "🚇",
    "🚈",
    "🚉",
    "🚊",
    "🚝",
    "🚞",
    "🚋",
    "🚌",
    "🚍",
    "🚎",
    "🚐",
    "🚑",
    "🚒",
    "🚓",
    "🚔",
    "🚕",
    "🚖",
    "🚗",
    "🚘",
    "🚙",
    "🛻",
    "🚚",
    "🚛",
    "🚜",
    "🏎",
    "🏍",
    "🛵",
    "🚲",
    "🛴",
    "🛹",
    "🚏",
    "🛣",
    "🛤",
    "🛢",
    "⛽",
    "🚨",
    "🚥",
    "🚦",
    "🛑",
    "🚧",
    "⚓",
    "⛵",
    "🛶",
    "🚤",
    "🛳",
    "⛴",
    "🛥",
    "🚢",
    "✈",
    "🛩",
    "🛫",
    "🛬",
    "💺",
    "🚁",
    "🚟",
    "🚠",
    "🚡",
    "🛰",
    "🚀",
    "🛸",
    "🛎",
    "🧳",
    "⌛",
    "⏳",
    "⌚",
    "⏰",
    "🌑",
    "🌒",
    "🌓",
    "🌔",
    "🌕",
    "🌖",
    "🌗",
    "🌘",
    "🌙",
    "🌚",
    "🌛",
    "🌜",
    "🌡",
    "☀",
    "🌝",
    "🌞",
    "⭐",
    "🌟",
    "🌠",
    "🌌",
    "☁",
    "⛅",
    "⛈",
    "🌤",
    "🌥",
    "🌦",
    "🌧",
    "🌨",
    "🌩",
    "🌪",
    "🌫",
    "🌬",
    "🌀",
    "🌈",
    "🌂",
    "☂",
    "☔",
    "⛱",
    "⚡",
    "❄",
    "☃",
    "⛄",
    "☄",
    "🔥",
    "💧",
    "🌊",
    "🎃",
    "🎄",
    "🎆",
    "🎇",
    "🧨",
    "✨",
    "🎈",
    "🎉",
    "🎊",
    "🎋",
    "🎍",
    "🎎",
    "🎏",
    "🎐",
    "🎑",
    "🧧",
    "🎀",
    "🎁",
    "🎗",
    "🎟",
    "🎫",
    "🎖",
    "🏆",
    "🏅",
    "🥇",
    "🥈",
    "🥉",
    "⚽",
    "⚾",
    "🥎",
    "🏀",
    "🏐",
    "🏈",
    "🏉",
    "🎾",
    "🥏",
    "🎳",
    "🏏",
    "🏑",
    "🏒",
    "🥍",
    "🏓",
    "🏸",
    "🥊",
    "🥋",
    "🥅",
    "⛳",
    "⛸",
    "🎣",
    "🎽",
    "🎿",
    "🛷",
    "🥌",
    "🎯",
    "🎱",
    "🔮",
    "🧿",
    "🎮",
    "🕹",
    "🎰",
    "🎲",
    "🧩",
    "🧸",
    "🃏",
    "🀄",
    "🎴",
    "🎭",
    "🖼",
    "🎨",
    "🧵",
    "🧶",
    "👓",
    "🕶",
    "🥽",
    "🥼",
    "👔",
    "👕",
    "👖",
    "🧣",
    "🧤",
    "🧥",
    "🧦",
    "👗",
    "👘",
    "👙",
    "👚",
    "👛",
    "👜",
    "👝",
    "🛍",
    "🎒",
    "👞",
    "👟",
    "🥾",
    "🥿",
    "👠",
    "👡",
    "👢",
    "👑",
    "👒",
    "🎩",
    "🎓",
    "🧢",
    "⛑",
    "📿",
    "💄",
    "💍",
    "💎",
    "🔇",
    "🔈",
    "🔉",
    "🔊",
    "📢",
    "📣",
    "📯",
    "🔔",
    "🔕",
    "🎼",
    "🎵",
    "🎶",
    "🎙",
    "🎚",
    "🎛",
    "🎤",
    "🎧",
    "📻",
    "🎷",
    "🎸",
    "🎹",
    "🎺",
    "🎻",
    "🥁",
    "📱",
    "📲",
    "☎",
    "📞",
    "📟",
    "📠",
    "🔋",
    "🔌",
    "💻",
    "🖥",
    "🖨",
    "⌨",
    "🖱",
    "🖲",
    "💽",
    "💾",
    "💿",
    "📀",
    "🧮",
    "🎥",
    "🎞",
    "📽",
    "🎬",
    "📺",
    "📷",
    "📸",
    "📹",
    "📼",
    "🔍",
    "🔎",
    "🕯",
    "💡",
    "🔦",
    "🏮",
    "📔",
    "📕",
    "📖",
    "📗",
    "📘",
    "📙",
    "📚",
    "📓",
    "📒",
    "📃",
    "📜",
    "📄",
    "📰",
    "🗞",
    "📑",
    "🔖",
    "🏷",
    "💰",
    "💴",
    "💵",
    "💶",
    "💷",
    "💸",
    "💳",
    "🧾",
    "💹",
    "✉",
    "📧",
    "📨",
    "📩",
    "📤",
    "📥",
    "📦",
    "📫",
    "📪",
    "📬",
    "📭",
    "📮",
    "🗳",
    "🖋",
    "🖊",
    "🖌",
    "🖍",
    "📝",
    "💼",
    "📁",
    "📂",
    "🗂",
    "📅",
    "📆",
    "🗒",
    "🗓",
    "📇",
    "📈",
    "📉",
    "📊",
    "📋",
    "📌",
    "📍",
    "📎",
    "🖇",
    "📏",
    "📐",
    "🗃",
    "🗄",
    "🗑",
    "🔒",
    "🔓",
    "🔏",
    "🔐",
    "🔑",
    "🔫",
    "🏹",
    "🛡",
    "🧰",
    "🧲",
    "💉",
    "💊",
    "🛏",
    "🛋",
    "🧽",
    "🧯",
    "🛒",
    "🚬",
    "🚸",
    "⛔",
    "🚫",
    "🚳",
    "🚭",
    "🚯",
    "🚱",
    "🚷",
    "📵",
    "🔞",
    "🔃",
    "🔄",
    "🔙",
    "🔚",
    "🔛",
    "🔜",
    "🔝",
    "🛐",
    "⚛",
    "🕉",
    "⛎",
    "🔀",
    "🔁",
    "🔂",
    "▶",
    "⏩",
    "⏭",
    "⏯",
    "◀",
    "⏪",
    "⏮",
    "🔼",
    "⏫",
    "🔽",
    "⏬",
    "⏸",
    "⏹",
    "⏺",
    "🎦",
    "🔅",
    "🔆",
    "📶",
    "📳",
    "📴",
    "❓",
    "❔",
    "❕",
    "❗",
    "🔱",
    "📛",
    "🔰",
    "⭕",
    "✅",
    "❌",
    "❎",
    "🔟",
    "🔠",
    "🔡",
    "🔢",
    "🔣",
    "🔤",
    "🅰",
    "🆎",
    "🅱",
    "🆑",
    "🆒",
    "🆓",
    "🆔",
    "🆕",
    "🆖",
    "🅾",
    "🆗",
    "🅿",
    "🆘",
    "🆙",
    "🆚",
    "🈁",
    "🈶",
    "🈯",
    "🉐",
    "🈹",
    "🈚",
    "🈲",
    "🉑",
    "🈸",
    "🈴",
    "🈳",
    "🈺",
    "🈵",
    "🔴",
    "🔵",
    "💠",
    "🔘",
    "🔳",
    "🔲",
    "🏁",
    "🚩",
    "🎌",
    "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
    "🏴󠁧󠁢󠁷󠁬󠁳󠁿"
];

export interface ReactionObject {
    emoji: string;
    count: number;
    username: Array<string>;
}

export interface ReactionSocketObject {
    emoji: string;
    username: string;
    messageId: string;
}
