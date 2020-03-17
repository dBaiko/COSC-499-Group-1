import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ChatboxComponent } from "./chatbox/chatbox.component";
import { FooterComponent } from "./footer/footer.component";
import { HeaderComponent } from "./header/header.component";
import { ChannelBrowserComponent } from "./channel-browser/channel-browser.component";
import { HomeComponent } from "./home.component";
import { LogoutFormComponent } from "./logout/logout-form.component";
import { SidebarComponent } from "./sidebar/sidebar.component";
import { MaterialModule } from "../material/material.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MessengerService } from "../shared/messenger.service";
import { SocketIoConfig, SocketIoModule } from "ngx-socket-io";
import { AuthenticationService } from "../shared/authentication.service";
import { CommonService } from "../shared/common.service";
import { CreateChannelComponent } from "./createChannel/create-channel.component";
import { MatSelectModule } from "@angular/material/select";
import { MatRadioModule } from "@angular/material/radio";
import { ProfileComponent } from "./profile/profile.component";
import { NotificationService } from "../shared/notification.service";
import { CookieService } from "ngx-cookie-service";
import { FriendsBrowserComponent } from "./sidebar/friends-browser/friends-browser.component";
import { UnsubscribeConfirmComponent } from "./sidebar/unsubscribe-confirm/unsubscribe-confirm.component";
import { SettingsComponent } from "./settings/settings.component";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import {ClickOutsideModule} from "ng-click-outside";

const socketConfig: SocketIoConfig = {
    url: "http://localhost:8080",
    options: {}
};

@NgModule({
    declarations: [
        ChatboxComponent,
        ChannelBrowserComponent,
        FooterComponent,
        HeaderComponent,
        HomeComponent,
        LogoutFormComponent,
        SidebarComponent,
        CreateChannelComponent,
        ProfileComponent,
        FriendsBrowserComponent,
        UnsubscribeConfirmComponent,
        SettingsComponent
    ],
    imports: [
        CommonModule,
        MaterialModule,
        ClickOutsideModule,
        FormsModule,
        ReactiveFormsModule,
        SocketIoModule.forRoot(socketConfig),
        MatSelectModule,
        MatRadioModule,
        MatSlideToggleModule
    ],
    exports: [
        HeaderComponent,
        HomeComponent,
        LogoutFormComponent,
        SidebarComponent,
        ChannelBrowserComponent,
        FooterComponent,
        ChatboxComponent
    ],
    providers: [MessengerService, CookieService, AuthenticationService, CommonService, NotificationService],
    entryComponents: [CreateChannelComponent, UnsubscribeConfirmComponent]
})
export class HomeModule {
}
