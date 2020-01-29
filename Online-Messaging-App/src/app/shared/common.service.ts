import { AuthenticationService } from "./authentication.service";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Constants, VALIDATION_MESSAGES } from "./app-config";

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
            console.log("Navigating to:" + route);
        });
    }
}
