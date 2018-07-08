import { Component, OnInit, ViewChild } from "@angular/core";
import { HttpErrorResponse } from "@angular/common/http";
import { ActivatedRoute, Router } from "@angular/router";

import { Observable } from "rxjs/Observable";
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw'; //to throw errors (errorHandling)
import 'rxjs/add/operator/do'; //for debugging
import 'rxjs/add/operator/catch'; //to catch errors (errorHandling)
import 'rxjs/add/operator/map'; //to map to HttpResponse

import { DxDataGridComponent } from "devextreme-angular/ui/data-grid";

// Imports for loading & configuring
import { GlobalSettingsService } from "../../services/globalSettings.service";
import { GridViewColumnService } from "../../services/gridViewColumn.service";
import { Constants } from "../../shared/constants";
import { MiscellaneousService } from "../../services/miscellaneous.service";
import { HelperService } from "../../services/helper.service";

export var fileVersion = '?tmplv=' + Date.now();
declare var jquery: any;
declare var $: any;

@Component({
  templateUrl: './projectsCustom.component.html?v=' + fileVersion
})
export class ProjectCustomComponent implements OnInit {

  //declaring class properties/variables
  private errorMessage: string;
  private view: any;
  private viewMode: string = Constants.VIEW_TYPE_CARD;
  private cardView: string = Constants.VIEW_TYPE_CARD;
  private gridView: string = Constants.VIEW_TYPE_GRID;
  private columns: any[] = [];
  private projects: any[] = [];
  private filteredprojects: any[] = [];

  @ViewChild(DxDataGridComponent) dataGrid: DxDataGridComponent;


  //constructor
  constructor(private globalSettings: GlobalSettingsService, private route: ActivatedRoute, private router: Router,
                private gridService: GridViewColumnService, private miscService: MiscellaneousService,
                private helperService: HelperService) {

    //using resolver to prefetch the data
    this.route.data.subscribe(
      data => {
        this.onGetViewDataComplete(data['viewData']);
      }
    );
  }

  //onInit()
  ngOnInit(): void { }

  private setViewClass(viewType: string): string {
    let rtnValue = '';
    if (viewType === this.viewMode) {
      rtnValue = 'active';
    }

    return rtnValue;
  }

  private changeView(viewType: string): void {
    switch (viewType) {
      case Constants.VIEW_TYPE_CARD:
        this.showCardView();
        this.viewMode = Constants.VIEW_TYPE_CARD;
        break;

      case Constants.VIEW_TYPE_GRID:
        this.showGridView();
        this.viewMode = Constants.VIEW_TYPE_GRID;
        break;

      default:
        break;
    }
  }

  private getProfilePicture(project: any): string {
    let rtnValue: string = '';

    for (var p in project) {
      if (project.hasOwnProperty(p)) {
        if (p.includes(Constants.QUESTION_CODE_PROJECT_LOGO)) {
          if (project[p]) {
            rtnValue = "data:image/png;base64," + project[p];
          }
          break;
        }
      }
    }
    
    return rtnValue;
  }

  private tagTextBoxKeyPress(evnt: any): void {
    //user pressed Enter
    if (evnt.keyCode === 13) {
      $('#txtFilterTag').blur();
    }
  }

  private onBlurTagTextBox(): void {

  }

  private showCardView(): void {
    $('#divEngagementsGridLayout').fadeOut('slow');
    $('#divEngagementsCardLayout').fadeIn('slow');
    $('#projectsSearch').fadeIn('slow');
  }

  private showGridView(): void {
    $('#divEngagementsCardLayout').fadeOut('slow');
    $('#projectsSearch').fadeOut('slow');
    $('#divEngagementsGridLayout').fadeIn('slow');
  }

  private onGetViewDataComplete(responseData: any): void {

    if (responseData && responseData.view) {
      this.view = responseData.view;

      //update action buttons 
      this.globalSettings.notifyViewChange(this.view);

      //get the columns to display
      this.columns = this.gridService.getGridViewColumns(responseData.view);

      //get the data
      this.projects = this.gridService.getGridViewData(responseData.view);

      this.globalSettings.Projects = this.projects;
    }

    if (this.projects.length > 0) {
      this.filteredprojects = this.projects;
    }
  }

  //exportToExcel
  private exportGridDataToExcel(): void {
    this.dataGrid.instance.exportToExcel(false);
    let divGridlayout = document.getElementById('divEngagementsGridLayout');
    //divGridlayout.style.display = 'block';
    divGridlayout.style.position = 'fixed';
    divGridlayout.style.top = '24%';
  }

  //edit
  private editEntity(entityId: number): void {

    this.SetAncestorEntity(entityId);
    this.navigateAway(null, entityId);
  }

  private onAddClick(): void {
    this.SetAncestorEntity(null);
    this.navigateAway(null, null);
  }

  private navigateAway(entityTypeId: number, entityId: number): void {
    //route to form View
    //let routePath = '/dashboard/' + Constants.ROUTE_PATH_TAB_VIEW;
    let routePath = '../' + Constants.ROUTE_PATH_TAB_VIEW;
    let viewCode = Constants.VIEW_CODE_PROJECT_TAB_VIEW;

    let params: any = {
      viewCode: viewCode
    };

    if (entityId)
      params.entityId = entityId;

    if (entityTypeId)
      params.entityTypeId = entityTypeId;


    this.router.navigate(
      [routePath, params],
      {
        relativeTo: this.route,
        //skipLocationChange: true
      }
    );
  }

  private handleError(error: HttpErrorResponse): Observable<any> {
    console.log("Error projectsCustomComponent: " + error.message);
    return Observable.throw(JSON.stringify(error));
  }

  private SetAncestorEntity(entityId: number) {
    let aEntity: any = null;

    if (entityId) {
      if (this.view.entities) {
        for (let iCount = 0; iCount < this.view.entities.length; iCount++) {
          if (this.view.entities[iCount].id === entityId) {
            aEntity = this.view.entities[iCount];
            break;
          }
        }
      }
    }

    this.globalSettings.AncestorEntity = aEntity;
  }

  private getProjectName(project: any): string {
    return this.helperService.getProjectName(project);
  }

  private onKeyupEvent(event: any): void {
    if (event.target.value) {
      this.filterprojects(event.target.value);
    }
    else {
      this.filteredprojects = this.projects;
    }
  }

  private filterprojects(filterText: string): void {
    this.filteredprojects = [];

    if (filterText) {
      for (let iCount = 0; iCount < this.projects.length; iCount++) {
        if (this.projects[iCount].name.toUpperCase().indexOf(filterText.toUpperCase()) !== -1) {
          this.filteredprojects.push(this.projects[iCount]);
        }
      }
    }
  }
}
