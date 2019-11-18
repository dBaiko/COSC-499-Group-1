import { NgModule } from "@angular/core";
import {MatButtonModule, MatButtonToggleModule, MatIconModule} from "@angular/material"
import {MatBadgeModule} from "@angular/material/badge";
const MaterialComponents =[
  MatButtonModule,
  MatButtonToggleModule,
  MatIconModule,
  MatBadgeModule
]
@NgModule({
  imports: [MaterialComponents],
  exports: [MaterialComponents]
})
export class MaterialModule {

}
