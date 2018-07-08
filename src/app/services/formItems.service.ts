import { Injectable } from "@angular/core";

import CustomStore from "devextreme/data/custom_store";
import ArrayStore from "devextreme/data/array_store";

import { HelperService } from "./helper.service";
import { Constants } from "../shared/constants";
import { MiscellaneousService } from "./miscellaneous.service";

@Injectable()
export class FormItemsService {

  private view: any;

  constructor(private helperService: HelperService, private miscService: MiscellaneousService) { }

  public getItemOptions(question: any, view: any): any {
    let options: any;
    this.view = view;

    switch (question.editorType.code.toUpperCase()) {
      case Constants.EDITOR_TYPE_CODE_DATE.toUpperCase():
        options = this.getDateOptions(question);
        break;

      case Constants.EDITOR_TYPE_CODE_SELECTBOX.toUpperCase():
        options = this.getSelectBoxLookupOptions(question);
        break;
        
      case Constants.EDITOR_TYPE_CODE_TEXTAREA.toUpperCase():
        options = this.getTextAreaOptions(question);
        break;

      case Constants.EDITOR_TYPE_CODE_TAGBOX.toUpperCase():
        options = this.getTagBoxOptions(question);
        break;

      case Constants.EDITOR_TYPE_CODE_CURRENCY.toUpperCase():
        options = this.getCurrencyOptions(question);
        break;

      case Constants.EDITOR_TYPE_CODE_PERCENT.toUpperCase():
        options = this.getPercentOptions(question);
        break;

      case Constants.EDITOR_TYPE_CODE_PROFILE_PICTURE.toUpperCase():
        options = this.getProfilePictureOptions(question);
        break;

      case Constants.EDITOR_TYPE_CODE_EMPTY.toUpperCase():
        options = this.getEmptyOptions();
        break;

      default:
        options = this.getDefaultOptions(question);
        break;
    }

    return options;
  }

  private getDefaultOptions(question: any): any {
    let defaultOptions: any = {};

    //defaultOptions.dataField = question.code;
    defaultOptions.dataField = question.dataField;

    //visibility
    defaultOptions.visible = this.isVisible(question);

    //set label
    defaultOptions.label = {
      text: question.title
    };

    //colSpan
    if (question.formOptions.colSpan)
      defaultOptions.colSpan = question.formOptions.colSpan

    //editor options
    defaultOptions.editorOptions = {};

    if (question.answer && question.answer.data) {
      //get formatted answer as per editorType
      defaultOptions.editorOptions.value = this.convertToFormattedAnswer(question);
    }

    defaultOptions.editorOptions.placeholder = question.formOptions.placeholder;
    defaultOptions.editorOptions.showClearButton = question.formOptions.showClearButton;
    defaultOptions.editorOptions.maxlength = 3500;

    //set validation rules
    defaultOptions.validationRules = [];

    //isRequired
    if (question.formOptions.isRequired) {
      let requiredValidationRule: any = {
        type: 'required',
        message: ''
      };

      defaultOptions.validationRules.push(requiredValidationRule);
    }


    //set CSS for child questions to be indented
    if (question.parentQuestionFk)
      defaultOptions.cssClass = 'tab';

    return defaultOptions;
  }
  
  private getTextAreaOptions(question: any): any {
    let options = this.getDefaultOptions(question);

    //set editorType
    options.editorType = Constants.DEVEX_EDITOR_PREFIX + Constants.EDITOR_TYPE_CODE_TEXTAREA;

    //height
    options.editorOptions.height = 120;
    if (question.formOptions.height)
      options.editorOptions.height = question.formOptions.height;

    return options;
  }

  private getDateOptions(question: any): any {
    let options = this.getDefaultOptions(question);

    //set editorType
    options.editorType = Constants.DEVEX_EDITOR_PREFIX + Constants.EDITOR_TYPE_CODE_DATE;

    //allow to open on click
    options.editorOptions.openOnFieldClick = true;

    return options;
  }

  private getCurrencyOptions(question: any): any {
    let options = this.getDefaultOptions(question);

    //set editorType
    options.editorType = Constants.DEVEX_EDITOR_PREFIX + Constants.EDITOR_TYPE_CODE_NUMBER;

    options.editorOptions.format = '$ #,##0.##';

    return options;
  }

  private getEmptyOptions(): any {
    let options: any = {
      itemType: Constants.EDITOR_TYPE_CODE_EMPTY
    }

    return options;
  }

  private getPercentOptions(question: any): any {
    let options = this.getDefaultOptions(question);

    //set editorType
    options.editorType = Constants.DEVEX_EDITOR_PREFIX + Constants.EDITOR_TYPE_CODE_NUMBER;

    options.editorOptions.format = '#0%';
    options.editorOptions.step = '0.001';

    return options;
  }

  private getSelectBoxLookupOptions(question: any): any {
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
    options.editorOptions.items = arrDropDownData;
    options.editorOptions.valueExpr = 'id';
    options.editorOptions.displayExpr = 'text';
    options.editorOptions.searchEnabled = true;

    //set the value
    if (question.answer && question.answer.data && (!isNaN(question.answer.data)))
      options.editorOptions.value = parseInt(question.answer.data);


    if (question.formOptions && question.formOptions.selectBoxOptions) {
      if (question.formOptions.selectBoxOptions.acceptCustomValue) {
        options.editorOptions.acceptCustomValue = true;
        options.editorOptions.onCustomItemCreating = function (args: any) {
          var newItem = {
            id: args.text,
            text: args.text
          };

          //only add an item if it is not already present
          var addItem = true;
          arrDropDownData.forEach(function (item) {
            if (item.id == newItem.id || item.text == newItem.id) {
              addItem = false;
              return;
            }
          });
          if (addItem) {
            arrDropDownData.push(newItem);
          };

          return newItem;
        };
      }
    }

    return options;
  }

  private getTagBoxOptions(question: any): any {
    let options = this.getDefaultOptions(question);
    let dropDownGroup: any;
    
    //set editorType
    options.editorType = Constants.DEVEX_EDITOR_PREFIX + Constants.EDITOR_TYPE_CODE_TAGBOX;

    //retreive the dropDownGroup
    if (this.view.dropDownGroups) {
      for (let iCount = 0; iCount < this.view.dropDownGroups.length; iCount++) {
        if (question.dropDownGroupFk === this.view.dropDownGroups[iCount].id) {
          dropDownGroup = this.view.dropDownGroups[iCount];
          break;
        }
      }
    }


    //assign items
    if (dropDownGroup) {
      options.editorOptions.items = dropDownGroup.dropDownData;
    }

    options.editorOptions.valueExpr = 'id';
    options.editorOptions.displayExpr = 'text';
    options.editorOptions.searchEnabled = true;
    options.editorOptions.openOnFieldClick = true;

    if (question.formOptions && question.formOptions.tagBoxOptions) {
      if (question.formOptions.tagBoxOptions.maxDisplayedTags) {
        options.editorOptions.maxDisplayedTags = question.formOptions.tagBoxOptions.maxDisplayedTags;
      }

      options.editorOptions.showSelectionControls = question.formOptions.tagBoxOptions.showSelectionControls;
      options.editorOptions.hideSelectedItems = question.formOptions.tagBoxOptions.hideSelectedItems;
    }

    return options;
  }

  private getProfilePictureOptions(question: any): any {
    let options = {
      //dataField: question.code,
      dataField: question.dataField,
      label: {
        text: question.title,
        visible: true
      },
      template: 'profilePictureCellTemplate'
    };

    return options;
  }

  public extractFormattedAnswer(question: any, iValue: any): any {
    var answerData = iValue;
    var rtnAnswer: any = {};
    
    switch (question.editorType.code) {
      case Constants.EDITOR_TYPE_CODE_DATE:
        if (iValue) {
          var dt = new Date(iValue);

          var date = dt.getDate();
          var month = dt.getMonth() + 1;
          var year = dt.getFullYear();

          answerData = month + '/' + date + '/' + year;
        }
        break;

      case Constants.EDITOR_TYPE_CODE_TAGBOX:
        if (iValue) {
          answerData = iValue.join(',');
        }
        break;

      default:
        break;
    }

    rtnAnswer.data = answerData;
    return rtnAnswer;
  }

  private convertToFormattedAnswer(question: any): any {
    var rtnValue: any = null;

    if (question.answer && question.answer.data) {
      rtnValue = question.answer.data;

      switch (question.editorType.code) {
        case Constants.EDITOR_TYPE_CODE_TAGBOX:
          rtnValue = rtnValue.split(',').map(function (rtnValue: any) { return Number(rtnValue); });
          break;

        case Constants.EDITOR_TYPE_CODE_CURRENCY:
          rtnValue = Number(rtnValue);
          break;

        case Constants.EDITOR_TYPE_CODE_PERCENT:
          rtnValue = Number(rtnValue);
          break;

        default:
          break;
      }
    }

    return rtnValue;
  }
  
  private isVisible(question: any): boolean {
    let rtnValue = true;
    let entity = this.view.entities[0];

    if (question.formOptions.clientVisible)
      rtnValue = question.formOptions.clientVisible;


    //if the question's visibility is dependent on parentQuestion's value
    if (question.parentQuestionFk && question.conditionalDropDownDataFk) {
      rtnValue = false; //hide the question by default

      //get parentQuestion      
      let parentQuestion = this.helperService.getQuestion(entity, question.parentQuestionFk, Constants.QUESTION_PROPERTY_ID);
      if (parentQuestion) {
        if (parentQuestion.answer && parentQuestion.answer.data) {
          if (parseInt(parentQuestion.answer.data) === question.conditionalDropDownDataFk) {
            rtnValue = true;
          }
        }
      }
    }

    return rtnValue;
  }
}
