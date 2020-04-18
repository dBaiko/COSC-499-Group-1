import { Component, OnInit } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";

@Component({
    selector: "app-markup-tutorial",
    templateUrl: "./markup-tutorial.component.html",
    styleUrls: ["./markup-tutorial.component.scss"]
})
export class MarkupTutorialComponent implements OnInit {
    constructor(public dialogRef: MatDialogRef<MarkupTutorialComponent>) {
    }

    public ngOnInit(): void {
    }

    public handleClose() {
        this.dialogRef.close(null);
    }
}
