import { Injectable } from "@angular/core";

import { GlobalSettingsService } from "./globalSettings.service";
import { MiscellaneousService } from "./miscellaneous.service";
import { Constants } from "../shared/constants";

@Injectable()
export class HelperService {

  constructor(private appSettings: GlobalSettingsService, private miscService: MiscellaneousService) { }

  //returns the question for the questionCode
  public getAnswer(entity: any, questionCode: string): string {
    let rtnValue: string = null;

    let question: any = this.getQuestion(entity, questionCode, Constants.QUESTION_PROPERTY_CODE);
    if (question !== null && question !== 'undefined') {
      if (question.answer !== null && question.answer !== 'undefined') {
        rtnValue = question.answer.data;
      }
    }

    return rtnValue;
  }

  //returns the question for the questionCode
  public getQuestion(entity: any, value: any, property: string): any {
    let rtnValue: any = null;
    let qFound: boolean = false;

    if (entity && value && property) {
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

                      if (question[property] === value) {
                        qFound = true;
                        rtnValue = question;

                        break;
                      }

                    }//end of questions loop

                    //break the questions loop
                    if (qFound)
                      break;
                  }
                }//end of quetionHeaders loop

                //break the questionHeaders loop
                if (qFound)
                  break;
              }
            }

            //break the questionGroups loop
            if (qFound)
              break;
          }//end of questionGroups loop

          //break the Sections loop
          if (qFound)
            break;
        }//end of sections loop
      }
    }

    return rtnValue;
  };

  //sorts array items in ascending order
  public sortAscending(a: any, b: any): any {
    if (a.sequenceOrder < b.sequenceOrder)
      return -1;

    if (a.sequenceOrder > b.sequenceOrder)
      return 1;

    return 0;
  }

  public allowAddNew(view: any): boolean {
    let rtnValue = false;

    if (view.actions) {
      for (let iCount = 0; iCount < view.actions.length; iCount++) {
        if (Constants.ACTION_CODE_ADD === view.actions[iCount].code) {
          rtnValue = true;
          break;
        }
      }
    }

    return rtnValue;
  }

  public allowCancel(view: any): boolean {
    let rtnValue = false;

    if (view.actions) {
      for (let iCount = 0; iCount < view.actions.length; iCount++) {
        if (Constants.ACTION_CODE_CANCEL === view.actions[iCount].code) {
          rtnValue = true;
          break;
        }
      }
    }

    return rtnValue;
  }

  public allowDelete(view: any): boolean {
    let rtnValue = false;

    //do not show delete button if user is trying to create a new entity
    if (view.entities) {
      if (view.entities[0] && view.entities[0].id) {
        if (view.actions) {
          for (let iCount = 0; iCount < view.actions.length; iCount++) {
            if (Constants.ACTION_CODE_DELETE === view.actions[iCount].code) {
              rtnValue = true;
              break;
            }
          }
        }
      }
    }

    return rtnValue;
  }

  public allowEdit(view: any): boolean {
    let rtnValue = false;

    if (view.actions) {
      for (let iCount = 0; iCount < view.actions.length; iCount++) {
        if (Constants.ACTION_CODE_EDIT === view.actions[iCount].code) {
          rtnValue = true;
          break;
        }
      }
    }

    return rtnValue;
  }

  public allowSave(view: any): boolean {
    let rtnValue = false;

    if (view.actions) {
      for (let iCount = 0; iCount < view.actions.length; iCount++) {
        if (Constants.ACTION_CODE_SAVE === view.actions[iCount].code) {
          rtnValue = true;
          break;
        }
      }
    }

    return rtnValue;
  }

  public allowExportToExcel(view: any): boolean {
    let rtnValue = false;

    if (view.actions) {
      for (let iCount = 0; iCount < view.actions.length; iCount++) {
        if (Constants.ACTION_CODE_EXPORT_TO_EXCEL === view.actions[iCount].code) {
          rtnValue = true;
          break;
        }
      }
    }

    //if there are no enitities then do not show
    if (view.entities) {
      if (view.entities.length === 1 && view.entities[0].id === 0) {
        rtnValue = false;
      }
    }

    return rtnValue;
  }

  public getActionButtonOnClickView(actionButtonCode: string, viewActions: any[]): any {
    let rtnValue: any;

    for (let iCount = 0; iCount < viewActions.length; iCount++) {
      if (actionButtonCode === viewActions[iCount].code) {
        rtnValue = viewActions[iCount].onClickView;
        break;
      }
    }

    return rtnValue;
  }

  public getFormattedDate(iValue: any): string {
    //return format: May 15, 2016
    let rtnValue: string;

    if (iValue) {
      let date = new Date(iValue);
      if (date.getFullYear() !== -1) {
        rtnValue = date.getMonth.name + ' ' + date.getDate() + ' ' + date.getFullYear();
      }
    }

    return rtnValue;

  }

  public getParentEntity(): any {
    return this.appSettings.AncestorEntity;
  }

  public getProjectName(project: any): string {
    let rtnValue: string = '';

    for (var p in project) {
      if (project.hasOwnProperty(p)) {
        if (p.includes(Constants.QUESTION_CODE_ENTITY_NAME)) {
          rtnValue = project[p];
          break;
        }
      }
    }

    return rtnValue;
  }
}

