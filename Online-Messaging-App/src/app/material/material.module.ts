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
    MatExpansionModule,
    MatSidenavModule,
    MatTabsModule,
    MatToolbarModule
} from "@angular/material"
import {MatBadgeModule} from "@angular/material/badge";
import {MatCardModule} from '@angular/material/card';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";


const material = [
    MatButtonModule,
    MatButtonToggleModule,
    MatTabsModule,
    MatExpansionModule,
    MatListModule,
    MatIconModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    MatSidenavModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    BrowserAnimationsModule
]

@NgModule({
    imports: [material],
    exports: [material],
    providers: [material]
})
export class MaterialModule {

}
