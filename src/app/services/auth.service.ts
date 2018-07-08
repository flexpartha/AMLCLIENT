import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from "@angular/common/http";

//rxjs imports
import { Observable } from "rxjs/Observable";
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw'; //to throw errors (errorHandling)
import 'rxjs/add/operator/do'; //for debugging
import 'rxjs/add/operator/catch'; //to catch errors (errorHandling)
import 'rxjs/add/operator/map'; //to map to HttpResponse

//application imports
import { User } from "../shared/user";
import { Constants } from "../shared/constants";
import { AppSettings } from "../shared/appSettings";


@Injectable()
export class AuthService {
  currentUser: User;

  //declare private variables
  private accountUrl = AppSettings.BASE_API_URL + "account/";

  constructor(private http: HttpClient) { }

  isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  //login function
  loginUser(userName: string, password: string): Observable<User> {
    const url = AppSettings.BASE_URL + "token";

    if (!userName || !password) {
      return Observable.of(null);
    }

    //setting header
    let requestOptions = {
      headers: new HttpHeaders()
    };
    requestOptions.headers.set('Content-Type', 'aplication/x-www-form-urlencoded');

    let data = "grant_type=password&username=" + userName + "&password=" + password;

    return this.http.post(url, data, requestOptions)
      .map(this.extractData)
      .catch(this.handleError);
  }


  //register function
  registerUser(newUser: any): Observable<any> {
    const url = this.accountUrl + "register";

    let requestOptions = {
      headers: new HttpHeaders(),
      params: new HttpParams()
    };
    requestOptions.headers.set('Content-Type', 'aplication/json');

    return this.http.post(url, newUser, requestOptions)
      .map(this.extractData)
      .do(data => console.log('newUser: ' + JSON.stringify(data))) // for debugging
      .catch(this.handleError);
  }

  //logout user
  logoutUser(): Observable<User> {
    const url = this.accountUrl + "logoutUserAsync";

    let headers = new HttpHeaders().set('Content-Type', 'aplication/json; charset=utf-8');
    let authHeader = headers.append('Authorization', 'Bearer ' + this.currentUser.access_token);


    //requestOptions.headers.set();
    let requestOptions = {
      headers: authHeader
    };
    
    return this.http.get(url, requestOptions)
      .map(this.extractData)
      .catch(this.handleError);
  }

  //error handling
  private handleError(error: HttpErrorResponse): Observable<any> {
    console.log("Error authService: " + error.message);

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
