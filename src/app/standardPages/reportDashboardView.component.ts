import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs/Subscription";

export var fileVersion = '?tmplv=' + Date.now();
declare var jquery: any;
declare var $: any;

@Component({
  templateUrl: './reportDashboardView.component.html?v=' + fileVersion
})
export class ReportDashboardViewComponent implements OnInit {
  private view: any;
  private url: string;

  //constructor
  constructor(private route: ActivatedRoute, private router: Router) {
    this.route.data.subscribe(
      data => {
        this.onGetViewDataComplete(data['viewData']);
      }
    );
  }

  ngOnInit(): void {
    $('#ifrDashboard').attr('src', this.url);
  }

  private onGetViewDataComplete(responseData: any): void {
    if (responseData && responseData.view) {
      this.view = responseData.view;

      if (this.view && this.view.reportOptions && this.view.reportOptions.url) {
        this.url = this.view.reportOptions.url;
      }
    }
  }
}
