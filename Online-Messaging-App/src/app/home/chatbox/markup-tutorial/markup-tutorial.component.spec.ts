import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { MarkupTutorialComponent } from "./markup-tutorial.component";
import { MaterialModule } from "../../../material/material.module";
import { MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { MarkdownModule } from "ngx-markdown";
import { SecurityContext } from "@angular/core";

describe("MarkupTutorialComponent", () => {
    let component: MarkupTutorialComponent;
    let fixture: ComponentFixture<MarkupTutorialComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MarkupTutorialComponent],
            imports: [MaterialModule, MatDialogModule, MarkdownModule.forRoot({
                sanitize: SecurityContext.NONE
            })],
            providers: [{ provide: MatDialogRef, useValue: {} }]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MarkupTutorialComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
