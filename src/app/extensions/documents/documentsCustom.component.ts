import { Component, OnInit, ViewChild } from "@angular/core";
import { HttpErrorResponse } from "@angular/common/http";
import { ActivatedRoute, Router } from "@angular/router";

import { Subscription } from "rxjs/Subscription";
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
import { DocumentService } from "../../services/document.service";


export var fileVersion = '?tmplv=' + Date.now();
declare var jquery: any;
declare var $: any;

@Component({
  templateUrl: './documentsCustom.component.html?v=' + fileVersion
})
export class DocumentsCustomComponent implements OnInit {
  private errorMessage: string;
  private columns: any[] = [];
  private documents: any[] = [];
  private view: any;
  private showGroupPanel: boolean = false;
  private showDeleteButton: boolean;
  private allowExportToExcel: boolean = true;
  private actionButtonClickSubscription: Subscription;
  @ViewChild(DxDataGridComponent) dataGrid: DxDataGridComponent;

  //constructor
  constructor(private route: ActivatedRoute, private router: Router, private globalSettings: GlobalSettingsService,
                private gridService: GridViewColumnService, private helperService: HelperService,
                private documentService: DocumentService, private miscService: MiscellaneousService) {

    //using resolver to prefetch the data
    this.route.data.subscribe(
      data => {
        this.onGetViewDataComplete(data['viewData']);
      }
    );
  }

  ngOnInit(): void { }

  private openDocument(data: any): void {
    this.documentService.getDocument(data.id)
      .subscribe(
      (responseData: any) => {

        let contentType = Constants.CONTENT_TYPE_STREAM; //'application/octet-stream';
        var blob = new Blob([responseData.blob()], { type: contentType });

        var link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = data.name;
        link.click();
      },
      (error: any) => {
        this.errorMessage = <any>error;
      }
      );
  }

  private onGetViewDataComplete(responseData: any): void {

    if (responseData && responseData.view) {
      this.view = responseData.view;

      //update action buttons 
      this.globalSettings.notifyViewChange(this.view);

      //get the data
      this.documents = this.view.documents;

      this.setGridOptions();
    }
        
    $('#divGridViewDisplay').fadeIn('slow');
  }

  private setGridOptions(): void {
    //showGroupPanel
    this.showGroupPanel = this.gridService.showGroupPanel(this.view);

    //edit option
    this.showDeleteButton = this.helperService.allowDelete(this.view);
  }

  private onEditorPreparing(e: any): void {
    let dateEditor = Constants.DEVEX_EDITOR_PREFIX + Constants.EDITOR_TYPE_CODE_DATE;

    if (e.parentType === 'filterRow') {
      if (e.editorName !== dateEditor) {
        e.editorOptions.placeholder = 'Type here to search';
      }
      else {
        e.editorOptions.openOnFieldClick = true;
      }
    }
  }

  private deleteDocument(documentId: number): void {

  }

  //exportToExcel
  private exportGridDataToExcel(): void {
    this.dataGrid.instance.exportToExcel(false);
  }

  private onFilterSearchTermsClick(): void {
    let input: any = {
      ancestorEntityId: this.globalSettings.AncestorEntity.id
    };

    let searchTerm = 'Deloitte';

    input.searchTerms = [searchTerm];
    
    this.miscService.getDocuments(input)
      .subscribe(
      (responseData: any) => { this.onGetDocumentsComplete(responseData) },
      (error: any) => { this.errorMessage = <any>error; }
      );
  }

  private onGetDocumentsComplete(responseData: any): void {
    this.documents = responseData.documents;
  }
}
