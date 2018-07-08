import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import notify from 'devextreme/ui/notify';
import { Subscription } from "rxjs/Subscription";

import { FormItemsService } from "../services/formItems.service";
import { EntityService } from "../services/entity.service";
import { HelperService } from "../services/helper.service";
import { Constants } from "../shared/constants";
import { GlobalSettingsService } from "../services/globalSettings.service";
import { DocumentService } from "../services/document.service";


export var fileVersion = '?tmpv=' + Date.now();
declare var jquery: any;
declare var $: any;

@Component({
  templateUrl: './formEditView.component.html?v=' + fileVersion,
  styleUrls: ['./formEditView.component.css?v=' + fileVersion]
})
export class FormEditViewComponent implements OnInit, OnDestroy {

  //declaring class properties/variables
  private errorMessage: string;
  private formData: any = {};
  private formItems: any[];
  private sectionItems: any[];
  private view: any;
  private entity: any;
  private arrSortedQuestions: any[] = [];
  private form: any;
  private showColonAfterLabel: any = false;
  private showFormCaption: any = false;
  private allowCancel: boolean = false;
  private allowDelete: boolean;
  private allowSave: boolean = true;
  private colCount: number = 2;
  private labelLocation: string;
  private showDocumentDeleteButton: boolean = true;
  private documents: any[] = [];
  private filesValue: any[] = [];
  private allowUploadingFiles: boolean;
  private actionButtonClickSubscription: Subscription;

  //constructor
  constructor(private route: ActivatedRoute, private router: Router, private entityService: EntityService,
                private formItemsService: FormItemsService, private helperService: HelperService,
                private appSettings: GlobalSettingsService, private documentService: DocumentService) {

    this.route.data.subscribe(
      data => {
        this.formItems = []; //reset formItems
        this.onGetViewDataComplete(data['viewData']);
      }
    );
  }

  ngOnInit(): void {
    //subscribe to 'onActionButtonClick' event
    let actionButtonCode: any;
    this.actionButtonClickSubscription = this.appSettings.onActionButtonClickEmitter$
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

      //raise event that view has changed
      this.appSettings.notifyViewChange(this.view);


      if (this.view.entities) {
        this.entity = this.view.entities[0];
        this.updateDocumentsToDisplay();
      }

      //draw the form
      this.drawForm();
    }
  }

  private updateDocumentsToDisplay(): void {
    if (this.entity.documents) {
      this.documents = [];

      for (let iCount = 0; iCount < this.entity.documents.length; iCount++) {
        if (!this.entity.documents[iCount].markDeleted) {
          this.documents.push(this.entity.documents[iCount]);
        }
      }
    }
  }

  private setViewProperties(): void {
    //set labelLocation
    if (this.view.formOptions && this.view.formOptions.labelLocation) {
      this.labelLocation = this.view.formOptions.labelLocation;
    }

    //set column count on screen
    if (this.view.formOptions && this.view.formOptions.colCount) {
      this.colCount = this.view.formOptions.colCount;
    }

    //showColonAfterLabel
    if (this.view.formOptions && this.view.formOptions.showColonAfterLabel) {
      this.showColonAfterLabel = this.view.formOptions.showColonAfterLabel;
    }

    //showFormCaption
    if (this.view.formOptions && this.view.formOptions.showFormCaption) {
      this.showFormCaption = this.view.formOptions.showFormCaption;
    }

    //showAttachments section
    if (this.view.formOptions && this.view.formOptions.allowUploadingFiles) {
      this.allowUploadingFiles = this.view.formOptions.allowUploadingFiles;
    }

  }

  private drawForm(): void {
    //loop through sections
    if (this.entity) {
      if (this.entity.sections) {

        //loop through each section
        for (let s = 0; s < this.entity.sections.length; s++) {
          let section: any = this.entity.sections[s];

          this.populateSectionItems(section);
          this.populateForm();

          //set this within drawForm() only
          this.setViewProperties();

          let formOptions: any = {
            itemType: 'group',
            colCount: this.colCount,
            items: this.sectionItems
          };


          //showFormCaption
          if (this.showFormCaption) {
            formOptions.caption = section.name;
          }

          this.formItems.push(formOptions);
        }
      }
    }
  }

  private populateSectionItems(section: any): void {

    //reset
    this.sectionItems = [];
    this.arrSortedQuestions = [];

    this.getAllQuestions(section);

    //arrange the questions in ascending order
    this.arrSortedQuestions.sort(this.helperService.sortAscending);
  }

  private getAllQuestions(section: any): void {
    if (section) {
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
                this.populateSubQuestions(qHeader.questions);
              }
            }
          }
        }
      }
    }
  }

  private populateSubQuestions(questions: any[]): void {
    for (let iCount = 0; iCount < questions.length; iCount++) {
      let question: any = questions[iCount];

      this.arrSortedQuestions.push(question);

      if (question.subQuestions)
        this.populateSubQuestions(question.subQuestions);
    }
  }

  private populateForm(): void {
    for (let q = 0; q < this.arrSortedQuestions.length; q++) {
      let question: any = this.arrSortedQuestions[q];

      //get formItem options
      let item = this.formItemsService.getItemOptions(question, this.view);
      if (item) {
        //set any property or event which can only be specified on this page.
        //E.g. calling a function onValueChane event
        this.setExtendedProperties(question, item);

        this.sectionItems.push(item);

        //populate formData. Set the default answer as NULL
        //this.formData[question.code] = null;
        this.formData[question.dataField] = null;

        if (question.answer)
          //this.formData[question.code] = question.answer.data;
          this.formData[question.dataField] = question.answer.data;
      }
    }
  }

  private onFormInit(e: any) {
    this.form = e.component;
  }

  private onSaveClick(): void {

    let formValidation = this.form.instance().validate();
    if (formValidation.isValid){

      //update answers
      this.updateAnswers();

      //update the ancestorEntity
      if (this.appSettings.AncestorEntity) {
        let parentEntity = this.helperService.getParentEntity();
        if (parentEntity) {
          if (parentEntity.id !== this.entity.id) {
            this.entity.parentEntity = parentEntity;
          }
        }
      }

      //call entityService to Save
      this.saveEntity();
    }
  }

  private updateAnswers(): void {
    if (this.entity) {
      //loop through all entity level questions
      if (this.entity.sections) {

        //loop through each section
        for (let s = 0; s < this.entity.sections.length; s++) {
          let section: any = this.entity.sections[s];

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
                    this.updateSubQuestionAnswers(qHeader.questions);
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  private updateSubQuestionAnswers(questions: any[]): void {
    for (let q = 0; q < questions.length; q++) {
      let question: any = questions[q];

      //get the formOptions for the question.
      //if the question is suppose to be hidden on UI then make the answer = NULL
      let formOptions = this.formItemsService.getItemOptions(question, this.view);
      if (formOptions.visible) {
        question.answer = this.getFormattedAnswer(question);
      }
      else {
        question.answer = null;
      }

      if (question.subQuestions && question.subQuestions.length > 0) {
        this.updateSubQuestionAnswers(question.subQuestions);
      }
    }
  }

  private saveEntity(): void {
    if (this.entity.id) {
      this.entityService.updateEntity(this.entity)
        .subscribe(
        (responseData: any) => { this.onSaveComplete(responseData) },
        (error: any) => { this.errorMessage = <any>error; }
        );
    }
    else {
      //it's a new entity
      this.entityService.addNewEntity(this.entity)
        .subscribe(
        (responseData: any) => { this.onSaveComplete(responseData) },
        (error: any) => { this.errorMessage = <any>error; }
        );
    }
  }

  private onDeleteClick(): void {

    //update answers
    if (this.entity) {
      //call entityService to Delete
      if (this.entity.id) {
        this.entityService.deleteEntity(this.entity.id)
          .subscribe(
          (responseData: any) => { this.onDeleteComplete(responseData) },
          (error: any) => { this.errorMessage = <any>error; }
          );
      }
    }
  }

  private onDeleteComplete(responseData: any): void {
    if (this.view.actions) {
      let onDeleteView: any = this.helperService.getActionButtonOnClickView(Constants.ACTION_CODE_DELETE, this.view.actions);
      if (onDeleteView) {
        let viewCode = onDeleteView.code;
        let routePath = onDeleteView.routePath;

        if (viewCode && routePath) {
          this.navigateAway(viewCode, routePath);
        }
      }
    }
  }

  private onCancelClick(): void {
    if (this.view.actions) {
      let onCancelView: any = this.helperService.getActionButtonOnClickView(Constants.ACTION_CODE_CANCEL, this.view.actions);
      if (onCancelView) {
        let viewCode = onCancelView.code;
        let routePath = onCancelView.routePath;

        if (viewCode && routePath) {
          this.navigateAway(viewCode, routePath);
        }
      }
    }
  }


  private onSaveComplete(responseData: any): void {
    if (this.view.actions) {
      let onSaveView: any = this.helperService.getActionButtonOnClickView(Constants.ACTION_CODE_SAVE, this.view.actions);
      if (onSaveView) {
        let viewCode = onSaveView.code;
        let routePath = onSaveView.routePath;

        if (viewCode && routePath) {
          if (this.view.formOptions && this.view.formOptions.showAlertOnSave) {
            notify('saved', 'success', 600);
          }

          this.navigateAway(viewCode, routePath);
        }
      }
    }
  }

  private getFormattedAnswer(question: any): any {
    let answer: any = question.answer;

    //get the user entered data
    let obj = this.formData;

    for (var p in obj) {
      if (obj.hasOwnProperty(p)) {
        //if (question.code === p) {
        if (question.dataField === p) {

          let newAnswerData = obj[p];

          if (newAnswerData) {
            //if (!answer)
            //  answer = {}; //initialize Answer object if it was null initially

            //get the formatted answer based on editorType
            answer = this.formItemsService.extractFormattedAnswer(question, newAnswerData);
          } else {

            //user deleted the answer
            answer = null;
          }

          break;
        }
      }
    };

    return answer;
  }

  //error handling
  private handleError(error: any) {
    console.log("Error formEditView: " + JSON.stringify(error));
  }

  private navigateAway(viewCode: string, routePath: string): void {
    routePath = '../' + routePath;
    let currentRoute = this.route;

    //sectionId
    let sectionId: number;
    if (this.entity.sections && this.entity.sections[0])
      sectionId = this.entity.sections[0].id;

    //route to form View
    this.router.navigate(
      [
        routePath,
        {
          viewCode: viewCode,
          entityId: this.entity.id,
          entityTypeId: this.view.entityType.id,
          sectionId: sectionId
        }
      ],
      {
        relativeTo: this.route,
        //skipLocationChange: true
      }
    );
  }

  private redrawForm(): void {
    this.updateAnswers();

    this.formItems = [];
    this.drawForm();
    this.form.instance();
  }

  private setExtendedProperties(question: any, item: any): void {
    if (question.editorType.code === Constants.EDITOR_TYPE_CODE_SELECTBOX) {
      if (question.subQuestions) {
        item.editorOptions.onValueChanged = () => this.redrawForm();
      }
    }
  }

  //profile picture
  private onProfilePictureValueChanged = function (e: any, dataField: any): void {

    let _self: any = this;

    if (e.value.length) {
      var reader = new FileReader();
      reader.readAsDataURL(e.value[0]);
      
      reader.onload = function (args: any) {
        $('#imgPreview').attr('src', args.target.result);

        if (reader.result) {
          let questionCode = dataField;
          let fileName: string = e.value[0].name;
          let fileType: string = e.value[0].type;
          let base64BlobData: any = reader.result.split(',').pop();
          let fileExtension = fileName.slice((fileName.lastIndexOf('.') - 1 >>> 0) + 2);

          let document: any = {
            base64BlobData: base64BlobData,
            name: fileName,
            fileType: fileType,
            extension: fileExtension
          };


          //add document to the question.
          let currentQuestion = _self.helperService.getQuestion(_self.entity, questionCode, Constants.QUESTION_PROPERTY_DATAFIELD);

          //intialize documents array for the current question
          if (!currentQuestion.documents) {
            currentQuestion.documents = [];
          }


          for (let iCount = 0; iCount < currentQuestion.documents.length; iCount++) {

            //existing document, mark it for deletion
            if (currentQuestion.documents[iCount].id) {
              currentQuestion.documents[iCount].markDeleted = true;
            }
            else {
              currentQuestion.documents.splice(iCount, 1);
            }
          }

          currentQuestion.documents.push(document);
        }
      }
    }
  }

  //attachments
  private onEntityFilesValueChanged = function (e: any): void {
    //for (let iCount = 0; iCount < this.filesValue.length; iCount++) {
    //  let name = this.filesValue[iCount].name;
    //  let type = this.filesValue[iCount].type;
    //  let size = this.filesValue[iCount].size;
    //  let lastModifiedDate = this.filesValue[iCount].lastModifiedDate;
    //  let base64BlobData: any = this.filesValue[iCount];
    //}

    let _self: any = this;

    if (e.value.length) {
      var reader = new FileReader();
      reader.readAsDataURL(e.value[0]);

      reader.onload = function (args: any) {
        if (reader.result) {
          let fileName: string = e.value[0].name;
          let fileType: string = e.value[0].type;
          let base64BlobData: any = reader.result.split(',').pop();
          let fileExtension = fileName.slice((fileName.lastIndexOf('.') - 1 >>> 0) + 2);

          let document: any = {
            id: null,
            base64BlobData: base64BlobData,
            name: fileName,
            fileType: fileType,
            extension: fileExtension
          };

          //if (!this.entity.documents) {
          //  this.entity.documents = [];
          //}

          //if (!this.documentExist(fileName)) {
          //  this.entity.documents.push(document);
          //  this.updateDocumentsToDisplay();
          //}

          if (!_self.entity.documents) {
            _self.entity.documents = [];
          }

          if (!_self.documentExist(fileName)) {
            _self.entity.documents.push(document);
            _self.updateDocumentsToDisplay();
          }
        }
      }
    }
  }

  private documentExist(name: string): boolean {
    let rtnValue: boolean = false;

    for (let iCount = 0; iCount < this.entity.documents.length; iCount++) {
      if (this.entity.documents[iCount].name.toUpperCase() === name.toUpperCase()) {
        rtnValue = true;
        break;
      }
    }

    return rtnValue;
  }

  private deleteDocument(document: any): void {
    for (let iCount = 0; iCount < this.entity.documents.length; iCount++) {

      //it's an existing document since it has an id
      if (document.id) {
        if (this.entity.documents[iCount].id === document.id) {
          this.entity.documents[iCount].markDeleted = true;
          break;
        }
      }
      else {
        //it's a newly added item so 'id' is null
        if (this.entity.documents[iCount].name === document.name) {
          this.entity.documents.splice(iCount, 1);
          break;
        }
      }
    }

    this.updateDocumentsToDisplay();
  }

  private getProfilePicture(qDataField: any): string {
    let rtnValue: string;

    let question = this.helperService.getQuestion(this.entity, qDataField, Constants.QUESTION_PROPERTY_DATAFIELD);
    if (question.documents && question.documents.length > 0) {
      let base64String = question.documents[0].base64BlobData;
      rtnValue = "data:image/png;base64," + base64String;
    }

    return rtnValue;
  }

  private actionButtonClicked(actionButtonCode: string): void {
    switch (actionButtonCode) {
      case Constants.ACTION_CODE_SAVE:
        this.onSaveClick();
        break;

      case Constants.ACTION_CODE_CANCEL:
        this.onCancelClick();
        break;

      case Constants.ACTION_CODE_DELETE:
        this.onDeleteClick();
        break;

      default:
        break;
    }
  }

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

  private onDocumentsGridContentReadyEventHandler(e: any): void {
    if (e.component.getDataSource().items().length == 0) {
      e.component.option('height', '10px');
    }
  }
}
