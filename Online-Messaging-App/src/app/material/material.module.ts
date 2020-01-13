import {NgModule} from "@angular/core";
import {
    MatButtonModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSidenavModule,
    MatTabsModule,
    MatToolbarModule
} from "@angular/material"
import {MatBadgeModule} from "@angular/material/badge";
import {MatCardModule} from '@angular/material/card';


const material = [
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
    MatCardModule
]

@NgModule({
    imports: [material],
    exports: [material],
    providers: [material]
})
export class MaterialModule {

}
