import { Component, OnInit, ViewChild } from "@angular/core";
import { AuthenticationService } from "../../shared/authentication.service";


const MY_SELECT_CHILD: string = "mySelect";
const MAT_SELECT_ARROW: string = "mat-select-arrow";
const CLASS_DROPPED: string = "dropped";

@Component({
    selector: "app-header",
    templateUrl: "./header.component.html",
    styleUrls: ["./header.component.scss"]
})
export class HeaderComponent implements OnInit {
    @ViewChild(MY_SELECT_CHILD, { static: false }) mySelect;
    userLoggedIn = false;
    user;

    constructor(private auth: AuthenticationService) {
        this.userLoggedIn = auth.isLoggedIn();
    }

    ngOnInit(): void {
        if (this.userLoggedIn == true) this.user = this.auth.getAuthenticatedUser();
    }

    drop() {
        let element = document.getElementsByClassName(MAT_SELECT_ARROW)[0];
        element.classList.add(CLASS_DROPPED);
    }

    unDrop() {
        let element = document.getElementsByClassName(MAT_SELECT_ARROW)[0];
        element.classList.remove(CLASS_DROPPED);
    }

    triggerSelect() {
        this.mySelect.toggle();
    }
}
