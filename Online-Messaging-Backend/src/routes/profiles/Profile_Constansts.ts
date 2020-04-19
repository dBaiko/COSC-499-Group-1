export const PROFILE_IMAGE_S3_PREFIX =
    "https://streamline-athletes-messaging-app.s3.ca-central-1.amazonaws.com/user-profile-images/";
export const DEFAULT_PROFILE_IMAGE = "default.png";
export const PROFILE_UPDATE_EXPRESSION =
    "SET firstName = :f, lastName=:l, phone = :p, bio = :b, gender = :g, dateOfBirth = :d, citizenship = :c," +
    " grade = :grade, gradYear = :gradYear, previousCollegiate = :prev, street = :s, unitNumber = :u," +
    " city = :city, province = :prov, country = :country, postalCode = :post, club = :club," +
    " injuryStatus = :inj, instagram = :insta, languages = :lang, coachFirstName = :cf, coachLastName = :cl," +
    " coachPhone = :cp, coachEmail = :ce, parentFirstName = :pf, parentLastName = :pl, parentPhone = :pp," +
    " parentEmail = :pe, budget = :bud";
export const STATUS_UPDATE_EXPRESSION = "SET statusText = :s";
export const PROFILE_IMAGE_UPDATE_EXPRESSION = "SET profileImage = :p";
export const USERNAME_UPDATE_EXPRESSION = "username = :username";
export const TWO_THOUSAND = "2000";
export const TEMP_RETRIEVAL_DIRECTORY = "./routes/profiles/temp/";
export const PROFILES_TABLE_NAME = "Profiles";

export const PATH_PUT_PROFILE: string = "/:username/";
export const PATH_GET_PROFILE: string = "/:username";
export const PATH_UPDATE_PROFILE_IMAGE: string = "/:username/profile-image/";
export const PATH_UPDATE_STATUS: string = "/:username/status/";
export const AUTH_KEY = "authorization";
export const COGNITO_USERNAME = "cognito:username";
export const TEMP_DIRECTORY = "routes/profiles/temp";
export const FILE = "file";
