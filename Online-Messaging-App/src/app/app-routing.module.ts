import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {RegisterFormComponent} from "./register/register-form.component";
import {LoginFormComponent} from "./login/login-form.component";
import {HomeComponent} from "./home/home.component";

const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'register', component: RegisterFormComponent},
  {path: 'login', component: LoginFormComponent}
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
