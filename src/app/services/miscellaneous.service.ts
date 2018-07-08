import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from "@angular/common/http";

import { Observable } from "rxjs/Observable";
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw'; //to throw errors (errorHandling)
import 'rxjs/add/operator/do'; //for debugging
import 'rxjs/add/operator/catch'; //to catch errors (errorHandling)
import 'rxjs/add/operator/map'; //to map to HttpResponse
import 'rxjs/add/operator/toPromise';

import { AuthService } from "./auth.service";
import { Constants } from "../shared/constants";
import { AppSettings } from "../shared/appSettings";


@Injectable()
export class MiscellaneousService {

  //declare private variables
  private miscellaneousUrl = AppSettings.BASE_API_URL + "miscellaneous/";

  //constructor
  constructor(private httpClient: HttpClient, private authService: AuthService) { }

  search(term: string) {
    const url = this.miscellaneousUrl + "getDropDownGroupData";

    let headers = new HttpHeaders().set('Content-Type', 'aplication/json; charset=utf-8');
    let authHeader = headers.append('Authorization', 'Bearer ' + this.authService.currentUser.access_token);

    //requestOptions.headers.set();
    let requestOptions = {
      headers: authHeader
    };

    let input: any = {
      dropDownGroupId: 3,
      searchValue: null
    };

    let promise = new Promise((resolve, reject) => {
      this.httpClient.post(url, input, requestOptions)
        .toPromise()
        .then(
          (res: any) => { // Success
            console.log(JSON.stringify(res));
            resolve();
          }
        );
    });

    return promise;
  }


  //getDropDownGroupData service method
  getDropDownGroupData(input: any): Observable<any[]> {
    const url = this.miscellaneousUrl + "getDropDownGroupData";

    let headers = new HttpHeaders().set('Content-Type', 'aplication/json; charset=utf-8');
    let authHeader = headers.append('Authorization', 'Bearer ' + this.authService.currentUser.access_token);
    
    let requestOptions = {
      headers: authHeader
    };

    return this.httpClient.post(url, input, requestOptions)
      .map(this.extractData)
      .catch(this.handleError);
  }
  

  //getDocuments service method
  getDocuments(input: any): Observable<any[]> {
    const url = this.miscellaneousUrl + "getDocuments";

    let headers = new HttpHeaders().set('Content-Type', 'aplication/json; charset=utf-8');
    let authHeader = headers.append('Authorization', 'Bearer ' + this.authService.currentUser.access_token);

    let requestOptions = {
      headers: authHeader
    };

    return this.httpClient.post(url, input, requestOptions)
      .map(this.extractData)
      .catch(this.handleError);
  }

  //getDocument service method
  //getDocument(documentId: number): Observable<any> {

  //  let input: any = {
  //    documentId: documentId
  //  };

  //  const url = this.miscellaneousUrl + "getDocument";
    
  //  let headers = new HttpHeaders().set('Content-Type', 'aplication/json; charset=utf-8');
  //  let authHeader = headers.append('Authorization', 'Bearer ' + this.authService.currentUser.access_token);
  //  let updatedHeader = authHeader.append('Accept', 'application/octet-stream')

  //  let requestOptions = {
  //    headers: updatedHeader
  //  };
    
  //  return this.httpClient.post(url, input, requestOptions)
  //    .map((response: any) => { return response;  })
  //    .catch(this.handleError);
  //}
  
  //getHyperGeometricDistribution service method
  getHyperGeometricDistribution(input: any): Observable<any[]> {
    const url = this.miscellaneousUrl + "getHyperGeometricDistribution";

    let headers = new HttpHeaders().set('Content-Type', 'aplication/json; charset=utf-8');
    let authHeader = headers.append('Authorization', 'Bearer ' + this.authService.currentUser.access_token);

    //requestOptions.headers.set();
    let requestOptions = {
      headers: authHeader
    };

    if (!input) {
      input = {
        populationSize: 15,
        success: 7,
        samples: 8
      };
    }

    return this.httpClient.post(url, input, requestOptions)
      .map(this.extractData)
      .catch(this.handleError);
  }

  //error handling
  private handleError(error: HttpErrorResponse): Observable<any> {
    console.log("Error miscellaneousService: " + error.message);

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
