import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkupTutorialComponent } from './markup-tutorial.component';

describe('MarkupTutorialComponent', () => {
  let component: MarkupTutorialComponent;
  let fixture: ComponentFixture<MarkupTutorialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarkupTutorialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarkupTutorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
