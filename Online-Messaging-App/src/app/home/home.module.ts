import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ChatboxComponent} from "./chatbox/chatbox.component";
import {FooterComponent} from "./footer/footer.component";
import {HeaderComponent} from "./header/header.component";
import {ChannelBrowserComponent} from "./channel-browser/channel-browser.component";
import {HomeComponent} from "./home.component";
import {LogoutFormComponent} from "./logout/logout-form.component";
import {SidebarComponent} from "./sidebar/sidebar.component";
import {MaterialModule} from "../material/material.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MessengerService} from "../shared/messenger.service";
import {SocketIoConfig, SocketIoModule} from "ngx-socket-io";
import {AuthenticationService} from "../shared/authentication.service";
import {CommonService} from "../shared/common.service";

const socketConfig: SocketIoConfig = {url: 'http://localhost:8080', options: {}};

@NgModule({
    declarations: [
        ChatboxComponent,
        ChannelBrowserComponent,
        FooterComponent,
        HeaderComponent,
        HomeComponent,
        LogoutFormComponent,
        SidebarComponent
    ],
    imports: [
        CommonModule,
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
        SocketIoModule.forRoot(socketConfig),
    ],
    exports: [
        HeaderComponent,
        HomeComponent,
        LogoutFormComponent,
        SidebarComponent,
<<<<<<< HEAD
        ChannelBrowserComponent,
=======
>>>>>>> 8ba055e5cb59f4cdb15d7296e3be593723cd81d0
        FooterComponent,
        ChatboxComponent
    ],
    providers: [MessengerService, AuthenticationService, CommonService]
})
export class HomeModule {
}
