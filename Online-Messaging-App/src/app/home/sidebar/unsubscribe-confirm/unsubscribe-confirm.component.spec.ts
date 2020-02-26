import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnsubscribeConfirmComponent } from './unsubscribe-confirm.component';

describe('UnsubscribeConfirmComponent', () => {
  let component: UnsubscribeConfirmComponent;
  let fixture: ComponentFixture<UnsubscribeConfirmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnsubscribeConfirmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnsubscribeConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
