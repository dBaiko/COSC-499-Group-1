import { AuthenticationService } from "./authentication.service";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Constants, UserObject, VALIDATION_MESSAGES } from "./app-config";
import * as sanitize from "sanitize-html";

const ESCAPE = "escape";
const NULL = "null";

@Injectable()
export class CommonService {
    public validation_methods = VALIDATION_MESSAGES;

    constructor(private router: Router, private auth: AuthenticationService) {
    }

    public checkIfLoggedIn(): boolean {
        return this.auth.isLoggedIn();
    }

    public moveToHome(): void {
        this.routeTo(Constants.HOME_ROUTE);
    }

    public routeTo(route: string): void {
        this.router.navigate([route]).then(() => {
        });
    }

    public inviteFormSearch(search: string, inviteSearchList: Array<UserObject>, userList: Array<UserObject>): boolean {
        if (search == Constants.EMPTY) {
            return false;
        } else {
            for (let i in userList) {
                if (this.searchStrings(userList[i].username.toLowerCase(), search.toLowerCase())) {
                    if (inviteSearchList.indexOf(userList[i]) === -1) {
                        inviteSearchList.push(userList[i]);
                    }
                } else {
                    if (inviteSearchList[inviteSearchList.indexOf(userList[i])]) {
                        inviteSearchList.splice(inviteSearchList.indexOf(userList[i]), 1);
                    }
                }
            }
        }
        return true;
    }

    public searchStrings(match: string, search: string): boolean {
        if (search === match) {
            return true;
        }
        if (search.length > match.length) {
            return false;
        }
        return match.substring(0, search.length) == search;
    }

    public sanitizeText(text: string): string {
        text = sanitize(text, {
            allowedTags: [],
            allowedAttributes: {},
            disallowedTagsMode: ESCAPE
        });
        if (text === null || text === NULL) {
            return Constants.EMPTY;
        }
        return text;
    }
}
