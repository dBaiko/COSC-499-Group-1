import {Component, OnInit, ViewChild} from "@angular/core";
import { AuthenticationService } from "../../shared/authentication.service";

@Component({
    selector: "app-header",
    templateUrl: "./header.component.html",
    styleUrls: ["./header.component.scss"]
})
export class HeaderComponent implements OnInit {
    @ViewChild('mySelect', {static: false}) mySelect;
    userLoggedIn = false;
    user;

    constructor(private auth: AuthenticationService) {
        this.userLoggedIn = auth.isLoggedIn();
    }

    ngOnInit(): void {
        if (this.userLoggedIn == true) this.user = this.auth.getAuthenticatedUser();
        console.log(this.user);
    }

    drop() {
        let element = document.getElementsByClassName("mat-select-arrow")[0];
        element.classList.add("dropped");
    }

    unDrop() {
        let element = document.getElementsByClassName("mat-select-arrow")[0];
        element.classList.remove("dropped");
    }

    triggerSelect() {
        this.mySelect.toggle();
    }
}
