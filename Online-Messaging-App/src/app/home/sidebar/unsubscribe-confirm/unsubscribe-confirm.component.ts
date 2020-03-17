import { Component, OnInit } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";

@Component({
    selector: "app-unsubscribe-confirm",
    templateUrl: "./unsubscribe-confirm.component.html",
    styleUrls: ["./unsubscribe-confirm.component.scss"]
})
export class UnsubscribeConfirmComponent implements OnInit {
    constructor(public dialogRef: MatDialogRef<UnsubscribeConfirmComponent>) {}

    ngOnInit() {}

    onClose(value: boolean) {
        this.dialogRef.close(value);
    }
}
