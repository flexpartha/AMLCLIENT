import { Injectable } from "@angular/core";
import query from 'devextreme/data/query';

import { Constants } from "../shared/constants";

declare var jquery: any;
declare var $: any;


@Injectable()
export class GridViewColumnService {

  private view: any;
  constructor() { }


  public getGridViewColumns(view: any): any[] {
    let columns: any[] = [];
    this.view = view;


    //ADD COLUMNS

    //only proceed if there are any incoming entities
    if (view.entities) {

      //get the first entity
      let entity = view.entities[0];

      if (entity) {
        //loop through all entity level questions
        if (entity.sections) {

          //loop through each section
          for (let s = 0; s < entity.sections.length; s++) {
            let section: any = entity.sections[s];

            //loop through each questionGroup
            if (section.questionGroups) {
              for (let g = 0; g < section.questionGroups.length; g++) {
                let qGroup: any = section.questionGroups[g];

                //loop through each questionHeader
                if (qGroup.questionHeaders) {
                  for (let h = 0; h < qGroup.questionHeaders.length; h++) {
                    let qHeader: any = qGroup.questionHeaders[h];

                    //loop through each question
                    if (qHeader.questions) {
                      for (let q = 0; q < qHeader.questions.length; q++) {
                        let question: any = qHeader.questions[q];

                        let column = this.getColumn(question);
                        columns.push(column);
                      }
                    }
                  }
                }
              }
            }
          }
        }


        //add ACTION column
        let actionColumn = this.getActionColumn();
        if (actionColumn)
          columns.push(actionColumn);
      }
    }

    return columns;
  }

  public getActionColumn(): any {
    let actionColumn: any = {
      dataField: "id",
      caption: '',
      name: 'actionCell',
      allowSorting: false,
      allowFiltering: false,
      allowExporting: false,
      alignment: 'center',
      cellTemplate: 'actionCellTemplate',
      width: 60
    }

    return actionColumn;
  }

  private getColumn(question: any): any {
    let rtnColumn: any = {};

    switch (question.editorType.code.toUpperCase()) {
      case Constants.EDITOR_TYPE_CODE_DATE.toUpperCase():
        rtnColumn = this.getDateColumnOptions(question);
        break;

      case Constants.EDITOR_TYPE_CODE_SELECTBOX.toUpperCase():
        rtnColumn = this.getSelectBoxLookupColumnOptions(question);
        break;

      case Constants.EDITOR_TYPE_CODE_TAGBOX.toUpperCase():
        rtnColumn = this.getTagBoxLookupColumnOptions(question);
        break;

      case Constants.EDITOR_TYPE_CODE_CURRENCY.toUpperCase():
        rtnColumn = this.getCurrencyColumnOptions(question);
        break;

      default:
        rtnColumn = this.getDefaultOptions(question);
        break;
    }

    return rtnColumn;
  }

  private getDateColumnOptions(question: any): any {
    let dateColumn = this.getDefaultOptions(question);
    dateColumn.dataType = Constants.DATA_TYPE_DATE.toLowerCase();
    dateColumn.format = 'MMM d, y';
    
    return dateColumn;
  }

  private getCurrencyColumnOptions(question: any): any {
    let currencyColumn = this.getDefaultOptions(question);
    currencyColumn.dataType = Constants.DATA_TYPE_NUMBER.toLowerCase();
    currencyColumn.format = 'currency';
      
    return currencyColumn;
  }

  private getDefaultOptions(question: any): any {
    let defaultOptions: any = {};

    defaultOptions.dataField = question.code;
    //defaultOptions.dataField = question.dataField;

    if (question.gridOptions) {

      if (question.gridOptions.headerText)
        defaultOptions.caption = question.gridOptions.headerText;

      //allowSorting
      defaultOptions.allowSorting = false; //need to do this as default sorting option is TRUE
      if (question.gridOptions.allowSorting)
        defaultOptions.allowSorting = question.gridOptions.allowSorting;

      if (question.gridOptions.sortOrder) {
        defaultOptions.sortOrder = question.gridOptions.sortOrder.toLowerCase();
      }

      //allowFiltering
      defaultOptions.allowFiltering = false; //need to do this as default filtering option is TRUE
      if (question.gridOptions.allowFiltering)
        defaultOptions.allowFiltering = question.gridOptions.allowFiltering;

      //width
      if (question.gridOptions.width)
        defaultOptions.width = question.gridOptions.width;

      //clientVisible
      defaultOptions.visible = false;
      if (question.gridOptions.clientVisible)
        defaultOptions.visible = question.gridOptions.clientVisible;

      //alignment
      //defaultOptions.alignment = 'center';

      defaultOptions.selectedFilterOption = "contains";
    }

    if (question.gridOptions.groupIndex != null)
        defaultOptions.groupIndex = 0;
    //if (question.code === 'QUEST_RISK_FACTOR')
    

    return defaultOptions;
  }

  private getSelectBoxLookupColumnOptions(question: any): any {
    let options = this.getDefaultOptions(question);
    let dropDownGroups: any[] = this.view.dropDownGroups;
    let arrDropDownData: any[] = [];

    //set editorType
    options.editorType = Constants.DEVEX_EDITOR_PREFIX + Constants.EDITOR_TYPE_CODE_SELECTBOX;

    //retreive the dropDown data
    if (dropDownGroups) {
      for (let iCount = 0; iCount < dropDownGroups.length; iCount++) {
        if (question.dropDownGroupFk === dropDownGroups[iCount].id) {
          arrDropDownData = dropDownGroups[iCount].dropDownData;
          break;
        }
      }
    }

    //assign items
    options.lookup = {
      dataSource: arrDropDownData,
      valueExpr: 'id',
      displayExpr: 'text'
    };

    return options;
  }

  private getTagBoxLookupColumnOptions(question: any): any {
    let options = this.getDefaultOptions(question);
    let dropDownGroups: any[] = this.view.dropDownGroups;
    let arrDropDownData: any[] = [];

    //set editorType
    options.editorType = Constants.DEVEX_EDITOR_PREFIX + Constants.EDITOR_TYPE_CODE_TAGBOX;

    //retreive the dropDown data
    if (dropDownGroups) {
      for (let iCount = 0; iCount < dropDownGroups.length; iCount++) {
        if (question.dropDownGroupFk === dropDownGroups[iCount].id) {
          arrDropDownData = dropDownGroups[iCount].dropDownData;
          break;
        }
      }
    }

    options.encodeHtml = false;

    options.calculateDisplayValue = function (rowData: any) {
      var filterExpression = [];
      let values = rowData[question.code];

      if (values) {
        for (let i = 0; i < values.length; i++) {
          if (i > 0) {
            filterExpression.push('or');
          }

          filterExpression.push(['id', values[i]]);
        }
      }

      var result = $.map(query(arrDropDownData).filter(filterExpression).toArray(), function (item: any) {
        return '&#8226; ' + item.text;
      }).join('<br/>');

      return result;
    }

    options.calculateFilterExpression = function (filterValues: any, selectedFilterOperation: any) {
      var filterExpression = [];
      for (var i = 0; i < filterValues.length; i++) {
        var filterExpr = [this.dataField, selectedFilterOperation || 'contains', filterValues[i]];
        if (i > 0) {
          filterExpression.push('or');
        }
        filterExpression.push(filterExpr);
      }
      return filterExpression;
    };

    options.onEditorPreparing = function (e: any) {
      if (e.parentType = 'filterRow') {
        e.editorName = Constants.DEVEX_EDITOR_PREFIX + Constants.EDITOR_TYPE_CODE_TAGBOX;

        e.editorOptions = {
          dataSource: arrDropDownData,
          valueExpr: 'id',
          displayExpr: 'text',
          showSelectionControls: true,
          value: e.value || [],
          onValueChanged: (args: any) => {
            e.setValue(args.value);
          }
        }
      }
    }

    return options;
  }

  //returns the formatted data to populate gridView
  public getGridViewData(view: any): any[] {
    let gridData: any[] = [];

    //only proceed if there are any incoming entities
    if (view.entities) {

      //loop through all entities
      for (let iCount = 0; iCount < view.entities.length; iCount++) {
        let entity: any = view.entities[iCount];

        //new row starts
        let rowData = {
          id: entity.id
        };

        //loop through all entity level questions
        if (entity.sections) {

          //loop through each section
          for (let s = 0; s < entity.sections.length; s++) {
            let section: any = entity.sections[s];

            //loop through each questionGroup
            if (section.questionGroups) {
              for (let g = 0; g < section.questionGroups.length; g++) {
                let qGroup: any = section.questionGroups[g];

                //loop through each questionHeader
                if (qGroup.questionHeaders) {
                  for (let h = 0; h < qGroup.questionHeaders.length; h++) {
                    let qHeader: any = qGroup.questionHeaders[h];

                    //loop through each question
                    if (qHeader.questions) {
                      for (let q = 0; q < qHeader.questions.length; q++) {
                        let question: any = qHeader.questions[q];

                        //POPULATE ANSWER
                        rowData[question.code] = null;
                        //rowData[question.dataField] = null;

                        if (question.answer && question.answer.data) {
                          rowData[question.code] = this.getFormattedAnswer(question);
                          //rowData[question.code] = question.answer.data;
                        }

                        //POPULATE PROFILE PICTURE
                        if (question.editorType.code.toUpperCase() === Constants.EDITOR_TYPE_CODE_PROFILE_PICTURE.toUpperCase()) {
                          if (question.documents) {
                            rowData[question.code] = question.documents[0].base64BlobData;
                            //rowData[question.dataField] = question.documents[0].base64BlobData;
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        
        gridData.push(rowData);
      }
    }

    if (gridData.length < 1) {
      gridData = null;
    }
    else if (gridData.length === 1) {
      if (gridData[0].id === 0) {
        gridData = null;
      }
    }

    return gridData;
  }

  public allowExportToExcel(view: any): boolean{
    let rtnValue = false;

    if (view.gridOptions.allowExportToExcel)
      rtnValue = true;

    //if there are no enitities then do not show
    if (view.entities) {
      if (view.entities.length === 1 && view.entities[0].id === 0) {
        rtnValue = false;
      }
    }

    return rtnValue;
  }

  public showGroupPanel(view: any): boolean {
    let rtnValue = false;

    if (view.gridOptions.allowGrouping)
      rtnValue = true;

    //if there are no enitities then do not show
    if (view.entities) {
      if (view.entities.length === 1 && view.entities[0].id === 0) {
        rtnValue = false;
      }
    }

    return rtnValue;
  }

  private getFormattedAnswer(question: any): any {
    let answerData: any = null;
    
    if (question.answer && question.answer.data) {
      answerData = question.answer.data;
    }

    let rtnAnswer: any = answerData;

    switch (question.editorType.code) {
      case Constants.EDITOR_TYPE_CODE_TAGBOX:
        if (answerData) {
          rtnAnswer = answerData.split(',');
          //rtnAnswer = [];
          //rtnAnswer.push(76);
          //rtnAnswer.push(78);
        }
        break;

      default:
        break;
    }

    return rtnAnswer;
  }
}
