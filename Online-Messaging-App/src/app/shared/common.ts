import {AuthenticationService} from "./authentication.service";
import {Injectable} from "@angular/core";
import {Router} from "@angular/router";
import {Constants} from "../config/app-config";

@Injectable()
export class Common {

  private auth = new AuthenticationService();

  constructor(private router: Router){}

  public checkIfLoggedIn(){
    return this.auth.isLoggedIn();
  }

  public moveToHome(){
    this.routeTo(Constants.HOME_ROUTE);
  }

  public routeTo(route: string) {
    this.router.navigate([route]);
  }

}