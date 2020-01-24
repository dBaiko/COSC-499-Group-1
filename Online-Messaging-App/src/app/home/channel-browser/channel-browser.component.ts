import {Component, OnInit} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {APIConfig} from "../../shared/app-config";

@Component({
    selector: 'app-channel-browser',
    templateUrl: './channel-browser.component.html',
    styleUrls: ['./channel-browser.component.scss'],
})
export class ChannelBrowserComponent implements OnInit {
    // channels = [1, 2, 3, 4, 5, 6, 7];

    channels;

    search = "";

    private url = APIConfig.GetChannelsAPI;

    constructor(private http: HttpClient) {
    }

    ngOnInit() {
        this.getChannels();
    }

    sendQuery() {
        for (let i in this.channels) {
            if (this.channels[i]["channelName"].includes(this.search.toString())) {
                this.channels[i]["filtered"] = false;
            } else {
                this.channels[i]["filtered"] = true;
            }
            //console.log(this.channels[i]);
        }
    }

    // TODO: change this to on a change of the search form
    onKey($event: KeyboardEvent) {
        //set search value as whatever is entered on search bar every keystroke
        this.search = ($event.target as HTMLInputElement).value;

        this.sendQuery();

    }

    getChannels(): void {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        this.http.get(this.url, httpOptions).subscribe((data) => {
                this.channels = data;
            },
            err => {
                console.log(err);
            });
    }

}
