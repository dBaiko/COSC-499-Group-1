import { Component, OnInit } from "@angular/core";
import { AuthenticationService } from "../../shared/authentication.service";
import { CommonService } from "../../shared/common.service";
import { Constants } from "../../shared/app-config";
import { NotificationService } from "../../shared/notification.service";

@Component({
    selector: "logout-form",
    templateUrl: "./logout-form.component.html",
    styleUrls: ["./logout-form.component.scss"]
})
export class LogoutFormComponent implements OnInit {
    constructor(
        private auth: AuthenticationService,
        public common: CommonService,
        private notificationService: NotificationService
    ) {
        this.notificationService = NotificationService.getInstance();
    }

    public ngOnInit(): void {
    }

    public logout(): void {
        this.notificationService.exitSocket(this.auth.getAuthenticatedUser().getUsername());
        this.auth.logOut();
        this.common.routeTo(Constants.LOGIN_ROUTE);
    }
}
