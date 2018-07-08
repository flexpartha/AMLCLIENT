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
export class EntityService {

  //declare private variables
  private entityUrl = AppSettings.BASE_API_URL + "entity/";
  
  //constructor
  constructor(private http: HttpClient, private authService: AuthService) { }


  //getUserDetails function
  getUserDetails(input: any): Observable<any> {
    const url = this.entityUrl + "getUserDetails";

    let headers = new HttpHeaders().set('Content-Type', 'aplication/json; charset=utf-8');
    let authHeader = headers.append('Authorization', 'Bearer ' + this.authService.currentUser.access_token);


    //requestOptions.headers.set();
    let requestOptions = {
      headers: authHeader
    };

    return this.http.post(url, input, requestOptions)
      .map(this.extractData)
      //.do(data => console.log('getUserDetails: ' + JSON.stringify(data))) // for debugging
      .catch(this.handleError);
  }


  //getEntityDetails function
  getEntityDetails(entityId: number): Observable<any> {
    const url = this.entityUrl + "getEntityDetails";

    let headers = new HttpHeaders().set('Content-Type', 'aplication/json; charset=utf-8');
    let authHeader = headers.append('Authorization', 'Bearer ' + this.authService.currentUser.access_token);


    //requestOptions.headers.set();
    let requestOptions = {
      headers: authHeader
    };


    let input: any = {
      entityId: entityId
    };

    return this.http.post(url, input, requestOptions)
      .map(this.extractData)
      //.do(data => console.log('getUserDetails: ' + JSON.stringify(data))) // for debugging
      .catch(this.handleError);
  }
  
  //addNewEntity function
  addNewEntity(entity: any): Observable<any> {
    const url = this.entityUrl + "addNewEntity";
    
    let headers = new HttpHeaders().set('Content-Type', 'aplication/json; charset=utf-8');
    let authHeader = headers.append('Authorization', 'Bearer ' + this.authService.currentUser.access_token);
    
    //requestOptions.headers.set();
    let requestOptions = {
      headers: authHeader
    };

    return this.http.post(url, entity, requestOptions)
      .map(this.extractData)
      //.do(data => console.log('saveEntity: ' + JSON.stringify(data))) // for debugging
      .catch(this.handleError);
  }

  //updateEntity function
  updateEntity(entity: any): Observable<any> {
    const url = this.entityUrl + "updateEntity";

    let headers = new HttpHeaders().set('Content-Type', 'aplication/json; charset=utf-8');
    let authHeader = headers.append('Authorization', 'Bearer ' + this.authService.currentUser.access_token);

    //requestOptions.headers.set();
    let requestOptions = {
      headers: authHeader
    };

    return this.http.post(url, entity, requestOptions)
      .map(this.extractData)
      //.do(data => console.log('saveEntity: ' + JSON.stringify(data))) // for debugging
      .catch(this.handleError);
  }

  //deleteEntity function
  deleteEntity(entityId: any): Observable<any> {
    const url = this.entityUrl + "deleteEntity";
    let input: any = {
      entityId: entityId
    };

    let headers = new HttpHeaders().set('Content-Type', 'aplication/json; charset=utf-8');
    let authHeader = headers.append('Authorization', 'Bearer ' + this.authService.currentUser.access_token);

    //requestOptions.headers.set();
    let requestOptions = {
      headers: authHeader
    };

    return this.http.post(url, input, requestOptions)
      .map(this.extractData)
      //.do(data => console.log('saveEntity: ' + JSON.stringify(data))) // for debugging
      .catch(this.handleError);
  }

  //tagBox data service
  getTagBoxData(input: any): Observable<any> {
    const url = this.entityUrl + "getUserDetails";

    let headers = new HttpHeaders().set('Content-Type', 'aplication/json; charset=utf-8');
    let authHeader = headers.append('Authorization', 'Bearer ' + this.authService.currentUser.access_token);


    //requestOptions.headers.set();
    let requestOptions = {
      headers: authHeader
    };

    return this.http.post(url, input, requestOptions)
      .map(this.extractData)
      .catch(this.handleError);
  }

  //error handling
  private handleError(error: HttpErrorResponse): Observable<any> {
    console.log("Error entityService: " + error.error.exceptionMessage);

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
