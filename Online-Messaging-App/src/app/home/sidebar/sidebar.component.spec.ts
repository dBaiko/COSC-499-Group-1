import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {HomeComponent} from '../home.component';
import { SidebarComponent } from './sidebar.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [
        SidebarComponent
      ],
       schemas: [
         CUSTOM_ELEMENTS_SCHEMA
       ]
    })
    .compileComponents().then(()=> {
      fixture = TestBed.createComponent(SidebarComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));
  //
  // beforeEach(() => {
  //   fixture = TestBed.createComponent(SidebarComponent);
  //   component = fixture.componentInstance;
  //   fixture.detectChanges();
  // });

  it('should have as title \' Public Channel\'', () => {
    const fixture = TestBed.createComponent(SidebarComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h2').textContent).toContain('Public Channel');
  });
});
