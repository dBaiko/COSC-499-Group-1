import { Component, OnInit } from "@angular/core";

@Component({
    selector: "app-friends-browser",
    templateUrl: "./friends-browser.component.html",
    styleUrls: ["./friends-browser.component.scss"]
})
export class FriendsBrowserComponent implements OnInit {
    value = " ";
    value1 = " ";
    value2 = " ";
    searching = false;

    constructor() {
    }

    ngOnInit() {
    }

    onKey($event: Event) {
        // this.search = ($event.target as HTMLInputElement).value;
        if (($event.target as HTMLInputElement).value == "") {
            this.searching = false;
            this.value = "";
            this.value1 = "";
            this.value2 = "";
        } else {
            this.searching = true;
            this.value = "Dylan";
            this.value1 = "Karanmeet";
            this.value2 = "Wiliam";
        }

    }

}
