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
<<<<<<< HEAD
    BrowserAnimationsModule
=======
>>>>>>> 8ba055e5cb59f4cdb15d7296e3be593723cd81d0
]

@NgModule({
    imports: [material],
    exports: [material],
    providers: [material]
})
export class MaterialModule {

}
