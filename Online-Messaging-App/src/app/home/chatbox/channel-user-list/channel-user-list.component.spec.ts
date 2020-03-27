import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { ChannelUserListComponent } from "./channel-user-list.component";

describe("ChannelUserListComponent", () => {
    let component: ChannelUserListComponent;
    let fixture: ComponentFixture<ChannelUserListComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ChannelUserListComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ChannelUserListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
