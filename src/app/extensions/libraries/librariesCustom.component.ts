import { Component, OnInit, ViewChild } from "@angular/core";
import { HttpErrorResponse } from "@angular/common/http";
import { ActivatedRoute, Router } from "@angular/router";

import { Observable } from "rxjs/Observable";
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw'; //to throw errors (errorHandling)
import 'rxjs/add/operator/do'; //for debugging
import 'rxjs/add/operator/catch'; //to catch errors (errorHandling)
import 'rxjs/add/operator/map'; //to map to HttpResponse

import { AccountService } from "../../services/account.service";
import { HelperService } from "../../services/helper.service";
import { Constants } from "../../shared/constants";

export var fileVersion = '?tmplv=' + Date.now();
declare var jquery: any;
declare var $: any;

@Component({
  templateUrl: './librariesCustom.component.html?v=' + fileVersion
})
export class LibrariesCustomComponent implements OnInit {
  //declaring class properties/variables
  private errorMessage: string;
  private libraries: any[] = [];
  private filteredLibraries: any[] = [];

  //constructor
  constructor(private route: ActivatedRoute, private router: Router, private accountService: AccountService) { }

  ngOnInit(): void {
    //get subscribed solutions for the loggedIn user
    this.accountService.GetSubscribedApplicationsAsync()
      .subscribe(
      (responseData: any) => { this.onGetSubscribedApplicationsAsyncComplete(responseData); },
      (error: any) => { this.errorMessage = <any>error; }
      );

  }

  private onGetSubscribedApplicationsAsyncComplete(responseData: any): void {
    if (responseData) {
      this.populateLibraries(responseData.account.applicationGroups);
    }
  }

  private populateLibraries(appGroups: any): void {
    for (let iCount = 0; iCount < appGroups.length; iCount++) {

      //only get libraries
      if (appGroups[iCount].code.toUpperCase() === Constants.APPLICATION_PAGE_GROUP_CODE_LIBRARIES.toUpperCase()) {
        for (let z = 0; z < appGroups[iCount].applications.length; z++) {
          this.libraries.push(appGroups[iCount].applications[z]);
        }

        break;
      }
    }

    if (this.libraries.length > 0) {
      this.filteredLibraries = this.libraries;
    }
  }

  private loadLibrary(library: any): void {
    if (library && library.primaryView) {
      let primaryView = library.primaryView;
      let routePath = '../' + primaryView.routePath;

      //relatively loading the route
      this.router.navigate(
        [
          routePath, { viewCode: primaryView.code }
        ],
        {
          relativeTo: this.route,
          //skipLocationChange: true
        }
      );
    }
    else {
      alert('ERROR: primaryView not defined');

      //redirect to error page
      this.router.navigate(
        ['errorPage'],
        {
          //skipLocationChange: true
        }
      );
    }
  }

  private getLibraryImage(library: any): string {
    let rtnValue: string = '';

    if (library.document) {
      rtnValue = "data:image/png;base64," + library.document.base64BlobData;
    }    

    return rtnValue;
  }

  private onKeyupEvent(event: any): void {
    if (event.target.value) {
      this.filterLibraries(event.target.value);
    }
    else {
      this.filteredLibraries = this.libraries;
    }
  }

  private filterLibraries(filterText: string): void {
    this.filteredLibraries = [];

    if (filterText) {
      for (let iCount = 0; iCount < this.libraries.length; iCount++) {
        if (this.libraries[iCount].name.toUpperCase().indexOf(filterText.toUpperCase()) !== -1) {
          this.filteredLibraries.push(this.libraries[iCount]);
        }
      }
    }
  }
}
