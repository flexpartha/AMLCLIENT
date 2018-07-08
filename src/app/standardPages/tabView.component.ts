import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs/Subscription";

import { GlobalSettingsService } from "../services/globalSettings.service";
import { HelperService } from "../services/helper.service";

export var fileVersion = '?tmplv=' + Date.now();
declare var jquery: any;
declare var $: any;

@Component({
  templateUrl: './tabView.component.html?v=' + fileVersion,
  styleUrls: ['./tabView.component.css?v=' + fileVersion]
})
export class TabViewComponent implements OnInit {

  //declaring class properties/variables
  private errorMessage: string;
  private entity: any;
  private sections: any[];
  private view: any;

  //constructor
  constructor(private route: ActivatedRoute, private router: Router,
                private appSettings: GlobalSettingsService, private helperService: HelperService) {

    //using resolver to prefetch the data
    this.route.data.subscribe(
      data => {
        this.onGetViewDataComplete(data['viewData']);
      }
    );
  }

  ngOnInit(): void {}

  private onGetViewDataComplete(responseData: any): void {

    if (responseData && responseData.view) {
      this.view = responseData.view;

      if (this.view.entities) {
        this.entity = this.view.entities[0];
        this.sections = this.entity.sections.sort(this.helperService.sortAscending);

        this.openDefaultSection();
      }
    }
  }

  private openDefaultSection(): void {
    for (let iCount = 0; iCount < this.sections.length; iCount++) {

      let section = this.sections[iCount];
      if (section.options && section.options.openByDefault) {
        this.onSectionClick(section);
        break;
      }
    }
  }

  private setSelectedSection(section: any): void {
    $('#ulTabsList li').each(function (key: any, value: any) {
      let sectionId = $(this).attr('id');
      if (sectionId) {

        if ($(this).hasClass('active')) {
          $(this).removeClass('active');
        }

        if (parseInt(sectionId) === section.id) {
          $(this).addClass('active');
        }
      }
    });
  }

  private onSectionClick(section: any): void {
    this.setSelectedSection(section);

    //route to specific view
    this.router.navigate(
      [
        section.view.routePath,
        {
          viewCode: section.view.code,
          entityId: this.entity.id,
          sectionId: section.id
        }
      ],
      {
        relativeTo: this.route,
        //skipLocationChange: true
      }
    );
  }
}
