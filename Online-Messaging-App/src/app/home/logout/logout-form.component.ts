import { Component, OnInit } from "@angular/core";
import { AuthenticationService } from "../../shared/authentication.service";
import { CommonService } from "../../shared/common.service";
import { Constants } from "../../shared/app-config";

@Component({
    selector: "logout-form",
    templateUrl: "./logout-form.component.html",
    styleUrls: ["./logout-form.component.scss"]
})
export class LogoutFormComponent implements OnInit {
    constructor(
        private auth: AuthenticationService,
        public common: CommonService
    ) {}

    ngOnInit(): void {}

    logout(): void {
        this.auth.logOut();
        this.common.routeTo(Constants.LOGIN_ROUTE);
    }
}
