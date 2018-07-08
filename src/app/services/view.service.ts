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
export class ViewService {

  constructor(private http: HttpClient, private authService: AuthService) { }

  //declare private variables
  private viewAPIUrl = AppSettings.BASE_API_URL + "view/";
  private accessToken = this.authService.currentUser ? this.authService.currentUser.access_token : '';

  private headers = new HttpHeaders().set('Content-Type', 'aplication/json; charset=utf-8');
  private authHeader = this.headers.append('Authorization', 'Bearer ' + this.accessToken);



  //getView function
  getView(input: any): Observable<any> {
    const url = this.viewAPIUrl + "getView";

    //requestOptions.headers.set();
    let requestOptions = {
      headers: this.authHeader
    };

    return this.http.post(url, input, requestOptions)
      .map(this.extractData)
      //.do(data => console.log('getView: ' + JSON.stringify(data))) // for debugging
      .catch(this.handleError);
  }

  //error handling
  private handleError(error: HttpErrorResponse): Observable<any> {
    console.log("Error viewService: " + error.message);

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
