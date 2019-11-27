import { NgModule } from "@angular/core";
import {MatButtonModule,MatTabsModule, MatButtonToggleModule, MatListModule, MatIconModule, MatProgressSpinnerModule,MatToolbarModule, MatSidenavModule, MatMenuModule, MatFormFieldModule,MatInputModule} from "@angular/material"
import {MatBadgeModule} from "@angular/material/badge";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";
import {MatCardModule} from '@angular/material/card';


const material =[
  MatButtonModule,
  MatButtonToggleModule,
  MatTabsModule,
  MatListModule,
  MatIconModule,
  MatBadgeModule,
  MatProgressSpinnerModule,
  MatToolbarModule,
  MatSidenavModule,
  MatMenuModule,
  MatFormFieldModule,
  MatInputModule,
  BrowserAnimationsModule,
  NoopAnimationsModule,
  MatCardModule
]
@NgModule({
  imports: [material],
  exports: [material],
  providers: [material]
})
export class MaterialModule {

}
