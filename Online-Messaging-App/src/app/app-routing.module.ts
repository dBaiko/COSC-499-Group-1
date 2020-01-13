import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from "./home.module/home.component";

const routes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'register', loadChildren: "../app/register/register.module#RegisterModule"},
    {path: 'login', loadChildren: "../app/login/login.module#LoginModule"}
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes)
    ],
    exports: [
        RouterModule
    ]
})
export class AppRoutingModule {
}
