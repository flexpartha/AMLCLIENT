import { Injectable } from "@angular/core";
import { Http, Headers, RequestOptions, ResponseContentType } from '@angular/http';

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
export class DocumentService {

  //declare private variables
  private miscellaneousUrl = AppSettings.BASE_API_URL + "miscellaneous/";

  //constructor
  constructor(private http: Http, private authService: AuthService) { }
  

  //getDocument service method
  getDocument(documentId: number): Observable<any> {

    let input: any = {
      documentId: documentId
    };

    const url = this.miscellaneousUrl + "getDocument";

    let headers = new Headers({
      'Content-Type': Constants.CONTENT_TYPE_JSON, //'application/json',
      'Accept': Constants.CONTENT_TYPE_STREAM, //'application/octet-stream',
      'Authorization': 'Bearer ' + this.authService.currentUser.access_token
    });


    let options = new RequestOptions({ headers: headers });
    options.responseType = ResponseContentType.Blob;

    return this.http.post(url, input, options)
      .map((response: any) => {
        return response;
      })
      .catch(
        (error: any) => {
          let kk = '';
          return Observable.throw(JSON.stringify(error));
        }
      );
  }
}
