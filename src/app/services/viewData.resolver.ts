import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from "@angular/common/http";
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router, ActivatedRoute } from '@angular/router';

import { Observable } from "rxjs/Observable";
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw'; //to throw errors (errorHandling)
import 'rxjs/add/operator/do'; //for debugging
import 'rxjs/add/operator/catch'; //to catch errors (errorHandling)
import 'rxjs/add/operator/map'; //to map to HttpResponse


import { ViewService } from "./view.service";
import { GlobalSettingsService } from "./globalSettings.service";


@Injectable()
export class ViewDataResolver implements Resolve<any>{
  constructor(private viewService: ViewService, private appSettings: GlobalSettingsService,
                private router: Router) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {

    let viewCode = route.params['viewCode'];
    let entityId = route.params['entityId'];
    let sectionId = route.params['sectionId'];
    let entityTypeId = route.params['entityTypeId'];
    
    let input: any = {
      viewCode: viewCode
    };

    if (!isNaN(entityId)) {
      input.entityId = entityId
    }

    if (!isNaN(sectionId)) {
      input.sectionId = sectionId
    }

    if (!isNaN(entityTypeId)) {
      input.entityTypeId = entityTypeId
    }

    if (this.appSettings.AncestorEntity) {
      input.ancestorEntityId = this.appSettings.AncestorEntity.id;
    }

    return this.viewService.getView(input)
      .map((responseData: any) => { return responseData; })
      .catch(error => {
        this.handleError(error);
        return Observable.of(null);
      });
  }

  //error handling
  private handleError(error: HttpErrorResponse): Observable<any> {
    console.log("Error getViewDataResolver: " + JSON.stringify(error));
    return Observable.throw(JSON.stringify(error));
  }
}
