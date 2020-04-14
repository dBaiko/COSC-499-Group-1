import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HomeComponent } from "./home/home.component";
import { RegisterFormComponent } from "./register/register-form.component";
import { LoginFormComponent } from "./login/login-form.component";
import { ProfileComponent } from "./home/profile/profile.component";

export const routes: Routes = [
    { path: "", component: HomeComponent },
    { path: "register", component: RegisterFormComponent },
    { path: "login", component: LoginFormComponent },
    { path: "profile", component: ProfileComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
