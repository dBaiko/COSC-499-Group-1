// noinspection SpellCheckingInspection
export const CognitoConfig = {
    UserPoolId: 'ca-central-1_6ickHVand',
    ClientId: '2n7od4b3prkjdc9trthuf3d92q'
};

export const APIConfig = {
    RegisterAPI: 'http://localhost:8080/users/',
    GetMessagesAPI: 'http://localhost:8080/messages/',
    GetChannelsAPI: 'http://localhost:8080/channels/',
    GetSubscribedChannelAPI: 'http://localhost:8080/userChannels/'
};

export const Constants = {
    LOGIN_ROUTE: "/login",
    REGISTER_ROUTE: '/register',
    HOME_ROUTE: '/',
    USERNAME: 'username',
    PASSWORD: 'password',
    EMPTY: ''
};

export const VALIDATION_MESSAGES = {
    'username': [
        {type: "required", message: "Username is required"},
        {type: "alreadyTaken", message: "Your username has already been taken"},
        {type: "pattern", message: "Username must only contain letters and characters"},
        {type: "invalidLogin", message: "Username or password is incorrect, please try again."}
    ],
    'email': [
        {type: "required", message: "Email is required"},
        {type: "email", message: "Invalid email"}
    ],
    'password': [
        {type: "required", message: "Password is required"},
        {type: "minlength", message: "Password must be at least 8 characters long"},
    ],
    "confirmPassword": [
        {type: "required", message: "Please confirm your password"},
        {type: "misMatch", message: "Passwords do not match"}
    ],
    "firstName": [
        {type: "required", message: "First name is required"},
        {type: "pattern", message: "First name must only contain letters and numbers"}
    ],
    "lastName": [
        {type: "required", message: "Last Name is required"},
        {type: "pattern", message: "Last Name must only contain letters and numbers"}
    ],
}


