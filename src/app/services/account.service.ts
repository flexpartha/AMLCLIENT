import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from "@angular/common/http";

import { Observable } from "rxjs/Observable";
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw'; //to throw errors (errorHandling)
import 'rxjs/add/operator/do'; //for debugging
import 'rxjs/add/operator/catch'; //to catch errors (errorHandling)
import 'rxjs/add/operator/map'; //to map to HttpResponse


import { AuthService } from "./auth.service";
import { Constants } from "../shared/constants";
import { AppSettings } from "../shared/appSettings";


@Injectable()
export class AccountService {

  //declare private variables
  private accountUrl = AppSettings.BASE_API_URL + "account/";

  //constructor
  constructor(private http: HttpClient, private authService: AuthService) { }


  //GetSubscribedApplicationsAsync function
  GetSubscribedApplicationsAsync(): Observable<any> {
    const url = this.accountUrl + "getSubscribedApplicationsAsync";

    let headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8');
    let authHeader = headers.append('Authorization', 'Bearer ' + this.authService.currentUser.access_token);


    //requestOptions.headers.set();
    let requestOptions = {
      headers: authHeader
    };

    return this.http.get(url, requestOptions)
      .map(this.extractData)
      //.do(data => console.log('getUserDetailsAsync: ' + JSON.stringify(data))) // for debugging
      .catch(this.handleError);
  }

  //error handling
  private handleError(error: HttpErrorResponse): Observable<any> {
    console.log("Error accountService: " + error.message);

    if (error.status === 401) {
      alert('not logged in');

      //reroute to login screen
    }

    return Observable.throw(JSON.stringify(error));
  }


  //extractData function
  private extractData(response: Response) {
    let body = response; //response.json();
    return body || {};
  }
}
