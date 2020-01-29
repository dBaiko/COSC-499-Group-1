import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { ChannelBrowserComponent } from "./channel-browser.component";

describe("ChannelBrowserComponent", () => {
    let component: ChannelBrowserComponent;
    let fixture: ComponentFixture<ChannelBrowserComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ChannelBrowserComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ChannelBrowserComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
