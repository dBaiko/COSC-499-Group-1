import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { UnsubscribeConfirmComponent } from "./unsubscribe-confirm.component";
import { MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { MaterialModule } from "../../../material/material.module";

describe("UnsubscribeConfirmComponent", () => {
    let component: UnsubscribeConfirmComponent;
    let fixture: ComponentFixture<UnsubscribeConfirmComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [UnsubscribeConfirmComponent],
            imports: [MaterialModule, MatDialogModule],
            providers: [{ provide: MatDialogRef, useValue: {} }]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(UnsubscribeConfirmComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
