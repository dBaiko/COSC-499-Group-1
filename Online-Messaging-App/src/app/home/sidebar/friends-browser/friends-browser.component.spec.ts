import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FriendsBrowserComponent } from './friends-browser.component';

describe('FriendsBrowserComponent', () => {
  let component: FriendsBrowserComponent;
  let fixture: ComponentFixture<FriendsBrowserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FriendsBrowserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FriendsBrowserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
