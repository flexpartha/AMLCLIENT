import { Component, OnInit, ViewChild, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs/Subscription";

import { DxDataGridComponent } from "devextreme-angular";

import { GridViewColumnService } from "../services/gridViewColumn.service";
import { Constants } from "../shared/constants";
import { GlobalSettingsService } from "../services/globalSettings.service";
import { HelperService } from "../services/helper.service";
import { ViewService } from "../services/view.service";


export var fileVersion = '?tmplv=' + Date.now();
declare var jquery: any;
declare var $: any;

@Component({
  templateUrl: './gridView.component.html?v=' + fileVersion
})
export class GridViewComponent implements OnInit, OnDestroy {
  //declaring class properties/variables
  private errorMessage: string;
  private columns: any[] = [];
  private gridData: any[] = [];
  private excelDataColumns: any[] = [];
  private excelGridData: any[] = [];
  private excelGridInstance: any = {};
  private view: any;
  private showGroupPanel: boolean = false;
  private showEditButton: boolean;
  private allowExportToExcel: boolean = true;
  private readyToExport: boolean = false;
  private actionButtonClickSubscription: Subscription;
  @ViewChild(DxDataGridComponent) dataGrid: DxDataGridComponent;

  //constructor
  constructor(private route: ActivatedRoute, private router: Router, private globalSettings: GlobalSettingsService,
                private gridService: GridViewColumnService, private helperService: HelperService,
                private viewService: ViewService) {

    //using resolver to prefetch the data
    this.route.data.subscribe(
      data => {
        this.onGetViewDataComplete(data['viewData']);
      }
    );
  }

  ngOnInit(): void {
    //subscribe to 'onActionButtonClick' event
    let actionButtonCode: any;
    this.actionButtonClickSubscription = this.globalSettings.onActionButtonClickEmitter$
      .subscribe(
      (res: any) => {
        actionButtonCode = res;
        this.actionButtonClicked(actionButtonCode);
      }
      );
  }

  ngOnDestroy() {
    this.actionButtonClickSubscription.unsubscribe();
  }

  private onGetViewDataComplete(responseData: any): void {

    if (responseData && responseData.view) {
      this.view = responseData.view;

      //update action buttons 
      this.globalSettings.notifyViewChange(this.view);

      //get the columns to display
      this.columns = this.gridService.getGridViewColumns(responseData.view);

      //get the data
      this.gridData = this.gridService.getGridViewData(responseData.view);

      this.setGridOptions();
    }
        
    $('#divGridViewDisplay').fadeIn('slow');
    this.initializeExcelGrid();
  }

  private setGridOptions(): void {
    //showGroupPanel
    this.showGroupPanel = this.gridService.showGroupPanel(this.view);

    //edit option
    this.showEditButton = this.helperService.allowEdit(this.view);
  }

  private editEntity(entityId: any): void {
    //for (let iCount = 0; iCount < this.view.actions.length; iCount++) {
    //  if (this.view.actions[iCount].code === Constants.ACTION_CODE_ON_EDIT) {
    //    let viewCode = this.view.actions[iCount].onClickView.code;
    //    let routePath = this.view.actions[iCount].onClickView.routePath;

    //    this.navigateAway(null, entityId, viewCode, routePath);
    //    break;
    //  }
    //}

    if (this.view.actions) {
      let onEditView: any = this.helperService.getActionButtonOnClickView(Constants.ACTION_CODE_EDIT, this.view.actions);
      if (onEditView) {
        let viewCode = onEditView.code;
        let routePath = onEditView.routePath;

        if (viewCode && routePath) {
          this.navigateAway(null, entityId, viewCode, routePath);
        }
      }
    }
  }

  private addNewEntity(): void {
    if (this.view.actions) {
      let onAddView: any = this.helperService.getActionButtonOnClickView(Constants.ACTION_CODE_ADD, this.view.actions);
      if (onAddView) {
        let viewCode = onAddView.code;
        let routePath = onAddView.routePath;

        if (viewCode && routePath) {
          this.navigateAway(this.view.entityType.id, null, viewCode, routePath);
        }
      }
    }
  }

  private navigateAway(entityTypeId: number, entityId: number, viewCode: string, routePath: string): void {
    $('#divGridViewDisplay').fadeOut('slow');

    routePath = '../' + routePath;
    let currentRoute = this.route;

    let params: any = {
      viewCode: viewCode
    };

    if (entityId)
      params.entityId = entityId;

    if (entityTypeId)
      params.entityTypeId = entityTypeId;

    //route to form View
    this.router.navigate(
      [
        routePath, params
      ],
      {
        relativeTo: this.route,
        //skipLocationChange: true
      }
    );
  }

  private onEditorPreparing(e: any): void {
    let dateEditor = Constants.DEVEX_EDITOR_PREFIX + Constants.EDITOR_TYPE_CODE_DATE;
    
    if (e.parentType === 'filterRow') {
      if (e.editorName === dateEditor) {
        e.editorOptions.openOnFieldClick = true;
      }
      else {
        e.editorOptions.placeholder = 'Type here to search';
      }

      let dataField = e.dataField;

      e.editorOptions.onValueChanged = function (args: any) {
        let jj = dataField;
        //alert(dataField);

        e.setValue(args.value);
      }
    }

    //this is done for showing tabBox within filterRow
    if (e.onEditorPreparing) {
      e.onEditorPreparing(e);
    }
  }
  

  //exportToExcel
  private exportGridDataToExcel(): void {
      this.getExcelGridData();
  }

  private initializeExcelGrid(): void {
    //this.excelDataColumns = this.columns;
    //this.excelGridData = this.gridData;
    //this.getExcelGridData();
  }


  private getExcelGridData(): void {
    let input: any = {
      viewCode: this.view.code,
      getGridViewColumnsOnly: false,
      returnRecordCount: 5000
    };
    

    if (this.globalSettings.AncestorEntity) {
      input.ancestorEntityId = this.globalSettings.AncestorEntity.id
    }

    //this is the service call to get all the data
    this.viewService.getView(input)
      .subscribe(
      (responseData: any) => {
        this.onGetExcelDataComplete(responseData);
      },
        (error: any) => { this.errorMessage = <any>error; }
      );
  }

  private onGetExcelDataComplete(responseData: any): void {
    setTimeout(() => {
      this.excelDataColumns = this.gridService.getGridViewColumns(responseData.view);
      this.excelGridData = this.gridService.getGridViewData(responseData.view);
      this.readyToExport = true;
    }, 100);
  }

  private onExcelGridInitializedEventHandler(e: any): void {
    this.excelGridInstance = e.component;
  }

  private onContentReadyEventHandler(e: any): void {
    if (this.readyToExport) {
      this.readyToExport = false;
      e.component.exportToExcel(false);
    }
  }

  private actionButtonClicked(actionButtonCode: string): void {
    switch (actionButtonCode) {
      case Constants.ACTION_CODE_EXPORT_TO_EXCEL:
        this.exportGridDataToExcel();
        break;

      case Constants.ACTION_CODE_ADD:
        this.addNewEntity();
        break;

      default:
        break;
    }
  }
}
