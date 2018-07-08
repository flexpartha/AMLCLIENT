import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from "@angular/common/http";
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

import { Observable } from "rxjs/Observable";
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw'; //to throw errors (errorHandling)
import 'rxjs/add/operator/do'; //for debugging
import 'rxjs/add/operator/catch'; //to catch errors (errorHandling)
import 'rxjs/add/operator/map'; //to map to HttpResponse

import { AuthService } from "./auth.service";
import { AccountService } from "./account.service";

@Injectable()
export class LandingDashboardResolver implements Resolve<any>{

  constructor(private accountService: AccountService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    return this.accountService.GetSubscribedApplicationsAsync()
      .map((responseData: any) => { return responseData; })
      .catch(error => {
        this.handleError(error);
        return Observable.of(null);
      });
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
}
